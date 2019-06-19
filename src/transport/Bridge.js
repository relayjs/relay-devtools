/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

// A transport for sending and listening for messages over the bridge.
export type BridgeTransport = {|
  listen: (callback: (data: BridgeMessage) => mixed) => void,
  send: (data: BridgeMessage) => void,
|};

// The types of messages which are sent over the bridge.
type BridgeMessage =
  | EventMessage
  | CallMessage
  | ResolveMessage
  | RejectMessage
  | PauseMessage
  | ResumeMessage
  | BatchMessage;

type EventMessage = {|
  type: 'event',
  name: string,
  data: mixed,
|};

type CallMessage = {|
  type: 'call',
  nonce: number,
  name: string,
  args: Array<mixed>,
|};

type ResolveMessage = {|
  type: 'resolve',
  nonce: number,
  value: mixed,
|};

type RejectMessage = {|
  type: 'reject',
  nonce: number,
  error: string,
|};

type PauseMessage = {|
  type: 'pause',
|};

type ResumeMessage = {|
  type: 'resume',
|};

type BatchMessage = {|
  type: 'batch',
  messages: Array<BridgeMessage>,
|};

// https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline
type IdleDeadline = {|
  didTimeout: boolean,
  timeRemaining(): number,
|};

// Ensure every call can be associated with call resolution using a nonce.
let nonceCounter = 0;

// Polyfill requestIdleCallback
let lastRunTime = 50;
const performanceNow =
  typeof performance === 'object' ? () => performance.now() : () => Date.now();
const cancelIdle =
  typeof cancelIdleCallback === 'function' ? cancelIdleCallback : clearTimeout;
const requestIdle =
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : function(cb) {
        // Custom polyfill that runs the queue with a backoff.
        // If you change it, make sure it behaves reasonably well in Firefox.
        // Magic numbers determined by tweaking in Firefox.
        // There is no special meaning to them.
        return setTimeout(() => {
          const startTime = performanceNow();
          cb({
            didTimeout: false,
            timeRemaining() {
              // Upper limit of 50ms
              return startTime + 50 - performanceNow();
            },
          });
          lastRunTime = performanceNow() - startTime;
        }, Math.min(500, 3 * lastRunTime));
      };

/**
 * Bridge:
 *
 * Responsible for serializing and sending messages between the Agent
 * (browser-side) and Frontend (console-side).
 *
 * It must be constructed with a BridgeTransport which can send serializable
 * data to the Bridge on the other side.
 */
export default class Bridge {
  _transport: BridgeTransport;
  _incomingBuffer: Array<BridgeMessage>;
  _outgoingBuffer: Array<BridgeMessage>;
  _listeners: {[key: string]: Array<(data: mixed) => mixed>};
  _callers: {[key: string]: () => any};
  _defers: {[key: number]: {resolve: mixed => void, reject: Error => void}};
  _flushHandle: ?number;
  _paused: boolean;

  constructor(transport: BridgeTransport): void {
    this._transport = transport;
    this._incomingBuffer = [];
    this._outgoingBuffer = [];
    this._listeners = {};
    this._callers = {};
    this._defers = {};
    this._flushHandle = null;
    this._paused = false;
    transport.listen(message => this._receiveMessage(message));
  }

  on(name: string, fn: mixed => mixed): void {
    if (!this._listeners[name]) {
      this._listeners[name] = [fn];
    } else {
      this._listeners[name].push(fn);
    }
  }

  off(name: string, fn: mixed => mixed): void {
    if (this._listeners[name]) {
      const i = this._listeners[name].indexOf(fn);
      if (i !== -1) {
        this._listeners[name].splice(i, 1);
      }
    }
  }

  once(name: string, fn: mixed => mixed): void {
    const listenOnce = data => {
      fn(data);
      this.off(name, listenOnce);
    };
    this.on(name, listenOnce);
  }

  emit(name: string, data: mixed): void {
    this._sendMessage({type: 'event', name, data});
  }

  onCall(name: string, handler: (...args: Array<mixed>) => mixed): void {
    if (this._callers[name]) {
      throw new Error('Only one call handler per call name allowed.');
    }
    this._callers[name] = handler;
  }

  call(name: string, ...args: Array<mixed>): Promise<mixed> {
    return new Promise((resolve, reject) => {
      const nonce = ++nonceCounter;
      this._defers[nonce] = {resolve, reject};
      this._sendMessage({type: 'call', nonce, name, args});
    });
  }

  pause(): void {
    this._sendMessage({type: 'pause'});
  }

  resume(): void {
    this._sendMessage({type: 'resume'});
  }

  // $FlowFixMe
  log(message) {
    // $FlowFixMe
    this._transport.send('log', message);
  }

  _receiveMessage(message: BridgeMessage): void {
    this._incomingBuffer.push(message);
    this._scheduleFlush();
  }

  _sendMessage(message: BridgeMessage): void {
    this._outgoingBuffer.push(message);
    this._scheduleFlush();
  }

  _scheduleFlush(): void {
    if (!this._flushHandle && this._hasBufferedMessages()) {
      const timeout = this._paused ? 5000 : 500;
      // $FlowFixMe
      this._flushHandle = requestIdle(
        deadline =>
          this._flushWhileIdle(
            // $FlowFixMe
            deadline,
          ),
        {timeout},
      );
    }
  }

  _cancelFlush(): void {
    if (this._flushHandle) {
      cancelIdle(
        // $FlowFixMe
        this._flushHandle,
      );
      this._flushHandle = null;
    }
  }

  _flushWhileIdle(deadline: IdleDeadline): void {
    this._flushHandle = null;

    const halfPast = deadline.timeRemaining() / 2;
    while (
      this._incomingBuffer.length > 0 &&
      (deadline.didTimeout || deadline.timeRemaining() > halfPast)
    ) {
      this._handleIncomingMessage(this._incomingBuffer.shift());
    }

    // Magic numbers were determined by tweaking in a heavy UI and seeing
    // what performs reasonably well both when DevTools are hidden and visible.
    // The goal is that we try to catch up but avoid blocking the UI.
    // When paused, it's okay to lag more, but not forever because otherwise
    // when user activates DevTools tab, it will freeze syncing.
    const chunkCount = this._paused ? 20 : 10;
    const chunkSize = Math.round(this._outgoingBuffer.length / chunkCount);
    const minChunkSize = this._paused ? 50 : 100;

    while (
      this._outgoingBuffer.length > 0 &&
      (deadline.didTimeout || deadline.timeRemaining() > 0)
    ) {
      const take = Math.min(
        this._outgoingBuffer.length,
        Math.max(minChunkSize, chunkSize),
      );
      this._flushOutgoingMessages(this._outgoingBuffer.splice(0, take));
    }

    if (this._hasBufferedMessages()) {
      this._scheduleFlush();
    }
  }

  _hasBufferedMessages(): boolean {
    return this._incomingBuffer.length > 0 || this._outgoingBuffer.length > 0;
  }

  _handleIncomingMessage(message: BridgeMessage): void {
    switch (message.type) {
      case 'event':
        this._handleIncomingEventMessage(message);
        return;
      case 'call':
        this._handleIncomingCallMessage(message);
        return;
      case 'resolve':
        this._handleIncomingResolveMessage(message);
        return;
      case 'reject':
        this._handleIncomingRejectMessage(message);
        return;
      case 'pause':
        this._handleIncomingPauseMessage(message);
        return;
      case 'resume':
        this._handleIncomingResumeMessage(message);
        return;
      case 'batch':
        this._handleIncomingBatchMessage(message);
        return;
      default:
        // eslint-disable-next-line no-unused-expressions
        (message.type: empty);
        throw new Error(`Unexpected message: ${message}`);
    }
  }

  _handleIncomingEventMessage(message: EventMessage): void {
    const listeners = this._listeners[message.name];
    if (listeners) {
      listeners.forEach(listener => listener(message.data));
    }
  }

  _handleIncomingCallMessage(message: CallMessage): void {
    new Promise(resolve => {
      const fn = this._callers[message.name];
      if (!fn) {
        throw new Error(`unknown call: "${message.name}"`);
      }
      resolve(fn(...message.args));
    }).then(
      value =>
        this._sendMessage({type: 'resolve', nonce: message.nonce, value}),
      error =>
        this._sendMessage({
          type: 'reject',
          nonce: message.nonce,
          error: `${error.message}\n${error.stack}`,
        }),
    );
  }

  _handleIncomingResolveMessage(message: ResolveMessage): void {
    const deferred = this._defers[message.nonce];
    delete this._defers[message.nonce];
    deferred.resolve(message.value);
  }

  _handleIncomingRejectMessage(message: RejectMessage): void {
    const deferred = this._defers[message.nonce];
    delete this._defers[message.nonce];
    deferred.reject(new Error(message.error));
  }

  // eslint-disable-next-line no-unused-vars
  _handleIncomingPauseMessage(message: PauseMessage): void {
    this._paused = true;
    this._cancelFlush();
  }

  // eslint-disable-next-line no-unused-vars
  _handleIncomingResumeMessage(message: ResumeMessage): void {
    this._paused = false;
    this._scheduleFlush();
  }

  _handleIncomingBatchMessage(message: BatchMessage): void {
    message.messages.forEach(batchedMessage => {
      this._handleIncomingMessage(batchedMessage);
    });
  }

  _flushOutgoingMessages(messages: Array<BridgeMessage>): void {
    if (messages.length === 1) {
      this._transport.send(messages[0]);
    } else {
      this._transport.send({type: 'batch', messages});
    }
  }
}
