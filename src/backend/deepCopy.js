/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * A helper to create a deep clone of a plain value, Object, or Array.
 */

'use strict';

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
    // $FlowFixMe
    return copy;
  }
  return value;
}
