/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * A helper to create a deep clone of a plain value, Object, or Array.
 */
export default function deepCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepCopy);
  }
  if (value && typeof value === 'object') {
    const copy = {};
    for (const prop in value) {
      if (hasOwnProperty.call(value, prop)) {
        copy[prop] = deepCopy(value[prop]);
      }
    }
    return copy;
  }
  return value;
}
