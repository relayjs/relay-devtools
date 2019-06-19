/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
