/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export function localStorageGetItem(key: string): any {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function localStorageSetItem(key: string, value: any): void {
  try {
    return localStorage.setItem(key, value);
  } catch (error) {}
}
