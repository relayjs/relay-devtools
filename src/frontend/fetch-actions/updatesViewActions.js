/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export function loadUpdates() {
  return {
    types: [
      'LOAD_UPDATE_EVENTS_REQUEST',
      'LOAD_UPDATE_EVENTS_SUCCESS',
      'LOAD_UPDATE_EVENTS_FAILURE',
    ],
    callAPI: (API, environment) =>
      Promise.resolve(API.getUpdateEvents({ environment })),
  };
}
