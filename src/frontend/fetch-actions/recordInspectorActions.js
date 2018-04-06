/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function loadRecord(id, fresh = false) {
  return {
    types: [
      'LOAD_RECORD_REQUEST',
      'LOAD_RECORD_SUCCESS',
      'LOAD_RECORD_FAILURE',
    ],
    callAPI: (API, environment) => API.getRecord({environment, id}),
    shouldCallAPI: ({recordInspector}) =>
      fresh || !recordInspector.fetchedRecords[id],
    id,
  };
}

export function loadTypeMapping() {
  return {
    types: [
      'LOAD_TYPE_MAPPING_REQUEST',
      'LOAD_TYPE_MAPPING_SUCCESS',
      'LOAD_TYPE_MAPPING_FAILURE',
    ],
    callAPI: (API, environment) => API.getAllRecordDescriptions({environment}),
  };
}
