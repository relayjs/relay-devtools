/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function loadUpdates() {
  return {
    types: [
      'LOAD_UPDATE_EVENTS_REQUEST',
      'LOAD_UPDATE_EVENTS_SUCCESS',
      'LOAD_UPDATE_EVENTS_FAILURE',
    ],
    callAPI: (API, environment) =>
      Promise.resolve(API.getUpdateEvents({environment})),
  };
}
