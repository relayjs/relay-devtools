/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export function shallowArraysEqual(a, b) {
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
export function deepObjectEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null && b !== null) {
    return false;
  }
  if (a !== null && b == null) {
    return false;
  }

  const alength = Object.keys(a).length;
  const blength = Object.keys(b).length;

  if (alength !== blength) {
    return false;
  }

  for (const key of Object.keys(a)) {
    if (Array.isArray(a[key])) {
      if (!shallowArraysEqual(a[key], b[key])) {
        return false;
      }
    } else if (typeof a[key] === 'object') {
      if (!deepObjectEqual(a[key], b[key])) {
        return false;
      }
    } else if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
