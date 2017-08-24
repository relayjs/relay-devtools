/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const changeCallbacks = {};

export default class ReactNativeBridgeAPI {
  constructor(bridge) {
    this.bridge = bridge;
  }

  async callBridge(method, ...args) {
    return new Promise(resolve => {
      this.bridge.call(method, args, resolve);
    });
  }

  async getEnvironments() {
    return this.callBridge('relayDebugger:getEnvironments');
  }

  async getRecord({ id, environment }) {
    if (!id) {
      return null;
    }
    return this.callBridge('relayDebugger:getRecord', environment, id);
  }

  async getAllRecordDescriptions({ environment }) {
    return this.callBridge(
      'relayDebugger:getMatchingRecords',
      environment,
      '',
      'idtype',
    );
  }

  async getRecords({ matchTerm, matchType, environment }) {
    const recordsPromise = this.callBridge(
      'relayDebugger:getMatchingRecords',
      environment,
      matchTerm,
      matchType,
    );

    return recordsPromise.then(records =>
      records.filter(
        record =>
          !record.id.startsWith('client:') || record.id === 'client:root',
      ),
    );
  }

  onChange({ environment, callback }) {
    if (!changeCallbacks[environment]) {
      const interval = setInterval(async () => {
        const isDirty = await this.callBridge(
          'relayDebugger:checkDirty',
          environment,
        );
        if (isDirty) {
          changeCallbacks[environment].callbacks.forEach(cb => cb());
        }
      }, 500);

      changeCallbacks[environment] = {
        interval,
        callbacks: [callback],
      };
    } else {
      changeCallbacks[environment].callbacks.push(callback);
    }
  }

  stopObservingChange({ environment }) {
    if (!changeCallbacks[environment]) {
      return;
    }
    clearInterval(changeCallbacks[environment].interval);
    delete changeCallbacks[environment];
  }

  startRecordingMutations({ environment }) {
    this.callBridge('relayDebugger:startRecording', environment);
  }

  stopRecordingMutations({ environment }) {
    this.callBridge('relayDebugger:stopRecording', environment);
  }

  async getRecordedMutationEvents({ environment }) {
    return this.callBridge('relayDebugger:getRecordedEvents', environment);
  }

  async checkForRelay() {
    return this.callBridge('relayDebugger:check');
  }
}
