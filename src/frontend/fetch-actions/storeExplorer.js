/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function loadRecordDescs({matchType, matchTerm}) {
  return {
    types: [
      'LOAD_RECORD_DESCS_REQUEST',
      'LOAD_RECORD_DESCS_SUCCESS',
      'LOAD_RECORD_DESCS_FAILURE',
    ],
    callAPI: (API, environment) =>
      API.getRecords({environment, matchType, matchTerm}),
  };
}
