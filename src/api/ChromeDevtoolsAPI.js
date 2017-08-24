/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import inspectedEval from '../util/inspectedEval';

const GET_REGISTERED_ENVIRONMENT_IDS =
  '__RELAY_DEBUGGER__.getRegisteredEnvironmentIds()';
const GET_RECORD =
  '__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).getRecord(%s)';
const GET_MATCHING_RECORDS =
  '__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).getMatchingRecords(%s, %s)';

// Check the flag and reset it before returning
const CHECK_DIRTY = `
var d = __RELAY_DEBUGGER__.getEnvironmentDebugger(%s);
var isDirty = d.isDirty();
d.resetDirty();
isDirty;
`;
const MUTATIONS_START_RECORDING = `
__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).startRecordingMutationEvents();
`;

const MUTATIONS_STOP_RECORDING = `
__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).stopRecordingMutationEvents();
`;

// Because Chrome Devtools API can't correctly serialize Errors, convert them to
// plain objects
const MUTATIONS_GET_RECORDED_EVENTS = `
var events =
  __RELAY_DEBUGGER__.getEnvironmentDebugger(%s).getRecordedMutationEvents();
events.forEach(event => {
  if (event.payload instanceof Error) {
    event.payload = {isError: true, message: event.payload.message};
  }
});
events;
`;

const CHECK_RELAY = '!!window.__RELAY_DEBUGGER__';

const changeCallbacks = {};

export default class ChromeDevtoolsAPI {
  async getEnvironments() {
    return inspectedEval(GET_REGISTERED_ENVIRONMENT_IDS);
  }

  async getRecord({ id, environment }) {
    if (!id) {
      return null;
    }
    return inspectedEval(GET_RECORD, environment, id);
  }

  async getAllRecordDescriptions({ environment }) {
    return inspectedEval(GET_MATCHING_RECORDS, environment, '', 'idtype');
  }

  async getRecords({ matchTerm, matchType, environment }) {
    const recordsPromise = inspectedEval(
      GET_MATCHING_RECORDS,
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
        const isDirty = await inspectedEval(CHECK_DIRTY, environment);
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
    inspectedEval(MUTATIONS_START_RECORDING, environment);
  }

  stopRecordingMutations({ environment }) {
    inspectedEval(MUTATIONS_STOP_RECORDING, environment);
  }

  async getRecordedMutationEvents({ environment }) {
    return inspectedEval(MUTATIONS_GET_RECORDED_EVENTS, environment);
  }

  async checkForRelay() {
    return inspectedEval(CHECK_RELAY);
  }
}
