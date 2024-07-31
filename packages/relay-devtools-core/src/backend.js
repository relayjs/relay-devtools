/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import Agent from 'src/backend/agent';
import Bridge from 'src/bridge';
import { installHook } from 'src/hook';
import { initBackend } from 'src/backend';
import { __DEBUG__ } from 'src/constants';

import type { BackendBridge } from 'src/bridge';
import type { DevToolsHook } from 'src/backend/types';
import type { WallEvent } from 'src/types';

type ConnectOptions = {
  host?: string,
  port?: number,
  isAppActive?: () => boolean,
  websocket?: ?WebSocket,
};

installHook(window);

const hook: DevToolsHook = window.__RELAY_DEVTOOLS_HOOK__;

function debug(methodName: string, ...args: [] | [any] | [string] | [Array<WallEvent>]) {
  if (__DEBUG__) {
    console.log(
      `%c[core/backend] %c${methodName}`,
      'color: teal; font-weight: bold;',
      'font-weight: bold;',
      ...args
    );
  }
}

export function connectToDevTools(options: ?ConnectOptions) {
  const {host = 'localhost', port = 8097, websocket, isAppActive = () => true} = options || {};

  let retryTimeoutID: TimeoutID | null = null;

  function scheduleRetry() {
    if (retryTimeoutID === null) {
      // Two seconds because RN had issues with quick retries.
      retryTimeoutID = setTimeout(() => connectToDevTools(options), 2000);
    }
  }

  if (!isAppActive()) {
    // If the app is in background, maybe retry later.
    // Don't actually attempt to connect until we're in foreground.
    scheduleRetry();
    return;
  }

  let bridge: BackendBridge | null = null;

  const messageListeners = [];
  const uri = 'ws://' + host + ':' + port;

  // If existing websocket is passed, use it.
  // This is necessary to support our custom integrations.
  // See D6251744.
  const ws = websocket ? websocket : new window.WebSocket(uri);
  ws.onclose = handleClose;
  ws.onerror = handleFailed;
  ws.onmessage = handleMessage;
  ws.onopen = function() {
    bridge = new Bridge({
      listen(fn) {
        messageListeners.push(fn);
        return () => {
          const index = messageListeners.indexOf(fn);
          if (index >= 0) {
            messageListeners.splice(index, 1);
          }
        };
      },
      sendAll(events: Array<WallEvent>) {
        if (ws.readyState === ws.OPEN) {
          if (__DEBUG__) {
            debug('wall.sendAll()', events);
          }

          ws.send(JSON.stringify(events));
        } else {
          if (__DEBUG__) {
            debug(
              'wall.send()',
              'Shutting down bridge because of closed WebSocket connection'
            );
          }

          if (bridge !== null) {
            bridge.emit('shutdown');
          }

          scheduleRetry();
        }
      },
    });

    const agent = new Agent(bridge);
    agent.addListener('shutdown', () => {
      // If we received 'shutdown' from `agent`, we assume the `bridge` is already shutting down,
      // and that caused the 'shutdown' event on the `agent`, so we don't need to call `bridge.shutdown()` here.
      hook.emit('shutdown');
    });

    initBackend(hook, agent, window);
  };

  function handleClose() {
    if (__DEBUG__) {
      debug('WebSocket.onclose');
    }

    if (bridge !== null) {
      bridge.emit('shutdown');
    }

    scheduleRetry();
  }

  function handleFailed() {
    if (__DEBUG__) {
      debug('WebSocket.onerror');
    }

    scheduleRetry();
  }

  function handleMessage(event: any | MessageEvent) {
    let data;
    try {
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
        if (__DEBUG__) {
          debug('WebSocket.onmessage', data);
        }
      } else {
        throw Error();
      }
    } catch (e) {
      console.error(
        '[Relay DevTools] Failed to parse JSON: ' + String(event.data)
      );
      return;
    }
    messageListeners.forEach(fn => {
      try {
        fn(data);
      } catch (error) {
        // jsc doesn't play so well with tracebacks that go into eval'd code,
        // so the stack trace here will stop at the `eval()` call. Getting the
        // message that caused the error is the best we can do for now.
        console.log('[Relay DevTools] Error calling listener', data);
        console.log('error:', error);
        throw error;
      }
    });
  }
}
