/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export function loadRecordDescs({ matchType, matchTerm }) {
  return {
    types: [
      'LOAD_RECORD_DESCS_REQUEST',
      'LOAD_RECORD_DESCS_SUCCESS',
      'LOAD_RECORD_DESCS_FAILURE',
    ],
    callAPI: (API, environment) =>
      API.getRecords({ environment, matchType, matchTerm }),
  };
}
