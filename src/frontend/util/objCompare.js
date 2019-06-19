/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

export function shallowArraysEqual<T>(
  a: $ReadOnlyArray<T>,
  b: $ReadOnlyArray<T>,
): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// XXX this function won't catch undefineds, dates and other special objects
// but it doesn't need to
export function deepObjectEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }
  if (a === null && b !== null) {
    return false;
  }
  if (a !== null && b == null) {
    return false;
  }

  // $FlowFixMe
  const alength = Object.keys(a).length;
  // $FlowFixMe
  const blength = Object.keys(b).length;

  if (alength !== blength) {
    return false;
  }

  // $FlowFixMe
  for (const key of Object.keys(a)) {
    // $FlowFixMe
    if (Array.isArray(a[key])) {
      // $FlowFixMe
      if (!shallowArraysEqual(a[key], b[key])) {
        return false;
      }
    } else if (typeof a[key] === 'object') {
      // $FlowFixMe
      if (!deepObjectEqual(a[key], b[key])) {
        return false;
      }
    } else if (
      // $FlowFixMe
      a[key] !== b[key]
    ) {
      return false;
    }
  }

  return true;
}
