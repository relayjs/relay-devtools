/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type Bridge from '../../transport/Bridge';

import type {UpdateEvent} from '../../backend/EnvironmentAgent';

/**
 * API:
 *
 * Provides the frontend with a high-level API for interacting with the
 * RelayEnvironment being developed.
 *
 * Constructed with a Bridge as a means of communicating with the browser-side.
 */
export default class BridgeAPI {
  _bridge: Bridge;
  _changeCallbacks: {[environment: string]: Array<() => void>};
  _recordSummaryCache: {[environment: string]: {[id: string]: string}};
  _updateEvents: Array<UpdateEvent>;

  constructor(bridge: Bridge): void {
    this._bridge = bridge;
    this._changeCallbacks = {};
    // $FlowFixMe
    this._onRegisterListeners = [];
    this._recordSummaryCache = {};
    // $FlowFixMe
    this._updateEvents = {};

    this._bridge.on('register', () => {
      // $FlowFixMe
      this._onRegisterListeners.forEach(cb => cb());
    });

    this._bridge.on('update', (event: $FlowFixMe) => {
      if (!this._updateEvents[event.environment]) {
        // $FlowFixMe
        this._updateEvents[event.environment] = [event];
      } else {
        // $FlowFixMe
        this._updateEvents[event.environment].push(event);
      }
      if (event.snapshotAfter) {
        this._updateRecordSummary(event.environment, event.snapshotAfter);
      }
      const callbacks = this._changeCallbacks[event.environment];
      if (callbacks) {
        callbacks.forEach(cb => cb());
      }
    });
  }

  getEnvironments() {
    return this._bridge.call('relayDebugger:getEnvironments');
  }

  getRecord({id, environment}: $FlowFixMe) {
    if (!id) {
      return null;
    }
    return this._bridge.call('relayDebugger:getRecord', environment, id);
  }

  getAllRecordDescriptions({environment}: $FlowFixMe) {
    const recordSummaryCache = this._recordSummaryCache[environment];
    if (recordSummaryCache) {
      // $FlowFixMe
      return Promise.resolve(recordSummaryCache);
    }
    return this._getAllRecordDescriptions(environment).then(result => {
      if (!this._recordSummaryCache[environment]) {
        // $FlowFixMe
        this._recordSummaryCache[environment] = result;
      }
      return result;
    });
  }

  _getAllRecordDescriptions(environment: $FlowFixMe) {
    return this._bridge.call(
      'relayDebugger:getMatchingRecords',
      environment,
      '',
      'idtype',
    );
  }

  _updateRecordSummary(environment: $FlowFixMe, snapshot: $FlowFixMe) {
    const recordSummaryCache = this._recordSummaryCache[environment];
    if (!recordSummaryCache) {
      return;
    }
    Object.keys(snapshot).forEach(id => {
      if (id.startsWith('client:')) {
        return;
      }
      const record = snapshot[id];
      if (!record) {
        delete recordSummaryCache[id];
      } else {
        recordSummaryCache[id] = record.__typename;
      }
    });
  }

  getRecords({matchTerm, matchType, environment}: $FlowFixMe) {
    return this._bridge
      .call(
        'relayDebugger:getMatchingRecords',
        environment,
        matchTerm,
        matchType,
      )
      .then(records => {
        // $FlowFixMe
        Object.keys(records).forEach(id => {
          if (id.startsWith('client:') && id !== 'client:root') {
            // $FlowFixMe
            delete records[id];
          }
        });

        return records;
      });
  }

  onChange({environment, callback}: $FlowFixMe) {
    if (!this._changeCallbacks[environment]) {
      this._changeCallbacks[environment] = [callback];
    } else {
      this._changeCallbacks[environment].push(callback);
    }
  }

  stopObservingChange({environment}: $FlowFixMe) {
    delete this._changeCallbacks[environment];
  }

  getUpdateEvents({environment}: $FlowFixMe) {
    // Return a copy to ensure immutability.
    // $FlowFixMe
    return (this._updateEvents[environment] || []).slice();
  }

  hasDetectedRelay() {
    return this._bridge.call('hasDetectedRelay');
  }

  onRegister(callback: $FlowFixMe) {
    // $FlowFixMe
    this._onRegisterListeners.push(callback);
  }
}
