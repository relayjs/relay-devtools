/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type { Bridge } from '../../transport/Bridge';

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
  _changeCallbacks: {
    [environment: string]: {
      interval: number,
      callbacks: Array<() => void>,
    },
  };

  constructor(bridge: Bridge): void {
    this._bridge = bridge;
    this._changeCallbacks = {};
  }

  callBridge(method, ...args) {
    return this._bridge.call(method, args);
  }

  getEnvironments() {
    return this._bridge.call('relayDebugger:getEnvironments');
  }

  getRecord({ id, environment }) {
    if (!id) {
      return null;
    }
    return this._bridge.call('relayDebugger:getRecord', environment, id);
  }

  getAllRecordDescriptions({ environment }) {
    return this._bridge.call(
      'relayDebugger:getMatchingRecords',
      environment,
      '',
      'idtype',
    );
  }

  async getRecords({ matchTerm, matchType, environment }) {
    const records = await this._bridge.call(
      'relayDebugger:getMatchingRecords',
      environment,
      matchTerm,
      matchType,
    );

    return records.filter(
      record => !record.id.startsWith('client:') || record.id === 'client:root',
    );
  }

  onChange({ environment, callback }) {
    if (!this._changeCallbacks[environment]) {
      const interval = setInterval(async () => {
        const isDirty = await this._bridge.call(
          'relayDebugger:checkDirty',
          environment,
        );
        if (isDirty) {
          this._changeCallbacks[environment].callbacks.forEach(cb => cb());
        }
      }, 500);

      this._changeCallbacks[environment] = {
        interval,
        callbacks: [callback],
      };
    } else {
      this._changeCallbacks[environment].callbacks.push(callback);
    }
  }

  stopObservingChange({ environment }) {
    if (!this._changeCallbacks[environment]) {
      return;
    }
    clearInterval(this._changeCallbacks[environment].interval);
    delete this._changeCallbacks[environment];
  }

  startRecordingMutations({ environment }) {
    this._bridge.call('relayDebugger:startRecording', environment);
  }

  stopRecordingMutations({ environment }) {
    this._bridge.call('relayDebugger:stopRecording', environment);
  }

  getRecordedMutationEvents({ environment }) {
    return this._bridge.call('relayDebugger:getRecordedEvents', environment);
  }

  checkForRelay() {
    return this._bridge.call('relayDebugger:check');
  }
}
