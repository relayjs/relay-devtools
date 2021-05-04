/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
export function shallowDiffers(prev: Object, next: Object): boolean {
  for (const attribute in prev) {
    if (!(attribute in next)) {
      return true;
    }
  }
  for (const attribute in next) {
    if (prev[attribute] !== next[attribute]) {
      return true;
    }
  }
  return false;
}

export function getEventId(event: {
  +transactionID?: ?number,
  +networkRequestId?: ?number,
  ...
}): number {
  const id = event.transactionID ?? event.networkRequestId;
  if (id == null) {
    throw new Error(
      'Expected a transactionID or networkRequestId for the event.'
    );
  }
  return id;
}
