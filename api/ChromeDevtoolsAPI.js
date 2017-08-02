/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import { inspectedEval } from '../util/util.js';

const GET_REGISTERED_ENVIRONMENT_IDS =
  '__RELAY_DEBUGGER__.getRegisteredEnvironmentIds()';
const GET_RECORD =
  '__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).getRecord(%s)';
const GET_MATCHING_RECORDS =
  '__RELAY_DEBUGGER__.getEnvironmentDebugger(%s).getMatchingRecords(%s, %s)';
const CHECK_DIRTY = `
var d = __RELAY_DEBUGGER__.getEnvironmentDebugger(%s);
var isDirty = d.isDirty();
d.resetDirty();
isDirty;
`;

const changeCallbacks = {};

export default class ChromeDevtoolsAPI {
  static async getEnvironments() {
    return inspectedEval(GET_REGISTERED_ENVIRONMENT_IDS);
  }

  static async getRecord({ id, environment }) {
    if (!id) {
      return null;
    }
    return inspectedEval(GET_RECORD, environment, id);
  }

  static async getAllRecordDescriptions({ environment }) {
    return inspectedEval(GET_MATCHING_RECORDS, environment, '', 'idtype');
  }

  static async getRecords({ matchTerm, matchType, environment }) {
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

  static onChange({ environment, callback }) {
    if (!changeCallbacks[environment]) {
      const interval = setInterval(() => {
        inspectedEval(CHECK_DIRTY, environment).then((isDirty, err) => {
          if (err) {
            throw err;
          }
          if (isDirty) {
            changeCallbacks[environment].callbacks.forEach(cb => cb());
          }
        });
      }, 500);

      changeCallbacks[environment] = {
        interval,
        callbacks: [callback],
      };
    } else {
      changeCallbacks[environment].callbacks.push(callback);
    }
  }

  static stopObservingChange({ environment }) {
    clearInterval(changeCallbacks[environment].interval);
    delete changeCallbacks[environment];
  }
}
