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
import type { LogEvent, EventData } from '../types';

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

  _environmentEventsMap: Map<number, Array<LogEvent>> = new Map();
  _environmentNames: Map<number, string> = new Map();

  constructor(bridge: FrontendBridge) {
    super();
    this._bridge = bridge;
    bridge.addListener('events', this.onBridgeEvents);
    bridge.addListener('shutdown', this.onBridgeShutdown);
  }

  getAllEvents(): $ReadOnlyArray<LogEvent> {
    let allEnvironmentEvents = [];
    this._environmentEventsMap.forEach((value, _) =>
      allEnvironmentEvents.push(...value)
    );
    return allEnvironmentEvents;
  }

  getEvents(environmentID: number): ?$ReadOnlyArray<LogEvent> {
    return this._environmentEventsMap.get(environmentID);
  }

  getEnvironmentNames(): Map<number, string> {
    return this._environmentNames;
  }

  onBridgeEvents = (events: Array<EventData>) => {
    for (let { id, envName, data } of events) {
      let arr = this._environmentEventsMap.get(id);
      if (arr) {
        arr.push(data);
      } else {
        this._environmentEventsMap.set(id, [data]);
        this._environmentNames.set(id, envName);
      }
      this.emit('mutated');
    }
  };

  clearAllEvents = () => {
    this._environmentEventsMap.forEach((_, key) => this.clearEvents(key));
    this.emit('mutated');
  };

  clearEvents = (environmentID: number) => {
    const completed = new Set();
    let eventArray = this._environmentEventsMap.get(environmentID);
    if (eventArray !== undefined && eventArray.length > 0) {
      for (const event of eventArray) {
        if (
          event.name === 'execute.complete' ||
          event.name === 'execute.error' ||
          event.name === 'execute.unsubscribe'
        ) {
          completed.add(event.transactionID);
        }
      }
      eventArray = eventArray.filter(
        event =>
          event.name !== 'queryresource.fetch' &&
          !completed.has(event.transactionID)
      );
      this._environmentEventsMap.set(environmentID, eventArray);
      this.emit('mutated');
    }
  };

  onBridgeShutdown = () => {
    if (__DEBUG__) {
      debug('onBridgeShutdown', 'unsubscribing from Bridge');
    }

    this._bridge.removeListener('events', this.onBridgeEvents);
    this._bridge.removeListener('shutdown', this.onBridgeShutdown);
  };
}
