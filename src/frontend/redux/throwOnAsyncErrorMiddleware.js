/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default function throwOnAsyncErrorMiddleware() {
  return next => action => {
    if (action.type && action.type.match(/_FAILURE$/)) {
      setTimeout(() => {
        throw action.error;
      });
    } else {
      next(action);
    }
  };
}
