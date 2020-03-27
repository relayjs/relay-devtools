/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import EventEmitter from 'events';
import type { FrontendBridge } from 'src/bridge';
import { __DEBUG__ } from '../constants';
import type { LogEvent } from '../types';

const debug = (methodName, ...args) => {
  if (__DEBUG__) {
    console.log(
      `%cStore %c${methodName}`,
      'color: green; font-weight: bold;',
      'font-weight: bold;',
      ...args
    );
  }
};

/**
 * The store is the single source of truth for updates from the backend.
 * ContextProviders can subscribe to the Store for specific things they want to provide.
 */
export default class Store extends EventEmitter<{|
  collapseNodesByDefault: [],
  componentFilters: [],
  mutated: [],
  recordChangeDescriptions: [],
  roots: [],
|}> {
  _bridge: FrontendBridge;

  _environmentEvents: Array<LogEvent> = [];
  _relayStoreRecords: any;

  constructor(bridge: FrontendBridge) {
    super();
    this._bridge = bridge;
    bridge.addListener('events', this.onBridgeEvents);
    bridge.addListener('shutdown', this.onBridgeShutdown);
  }

  getEvents(): $ReadOnlyArray<LogEvent> {
    return this._environmentEvents;
  }

  getRecords(): any {
    return this._relayStoreRecords;
  }

  onBridgeEvents = (events: Array<LogEvent>) => {
    for (const event of events) {
      if (event.name === 'store.updated') {
        this._relayStoreRecords = event.records;
      } else {
        this._environmentEvents.push(event);
      }
    }

    this.emit('mutated');
  };

  clearEvents = () => {
    const completed = new Set();
    for (const event of this._environmentEvents) {
      if (
        event.name === 'execute.complete' ||
        event.name === 'execute.error' ||
        event.name === 'execute.unsubscribe'
      ) {
        completed.add(event.transactionID);
      }
    }
    this._environmentEvents = this._environmentEvents.filter(
      event =>
        event.name !== 'queryresource.fetch' &&
        !completed.has(event.transactionID)
    );
    this.emit('mutated');
  };

  onBridgeShutdown = () => {
    if (__DEBUG__) {
      debug('onBridgeShutdown', 'unsubscribing from Bridge');
    }

    this._bridge.removeListener('events', this.onBridgeEvents);
    this._bridge.removeListener('shutdown', this.onBridgeShutdown);
  };
}
