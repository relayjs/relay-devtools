/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Use this file as one of the entry points to explicitly mark Electron-like
// environment
if (typeof process !== 'undefined') {
  process.__ELECTRON__ = true;
}
