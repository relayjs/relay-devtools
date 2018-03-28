/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
