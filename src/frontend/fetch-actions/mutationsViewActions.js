/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export function loadMutations() {
  return {
    types: [
      'LOAD_MUTATION_EVENTS_REQUEST',
      'LOAD_MUTATION_EVENTS_SUCCESS',
      'LOAD_MUTATION_EVENTS_FAILURE',
    ],
    callAPI: (API, environment) =>
      API.getRecordedMutationEvents({ environment }),
  };
}
