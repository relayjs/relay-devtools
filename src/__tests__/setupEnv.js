/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import storage from 'local-storage-fallback';

// In case async/await syntax is used in a test.
import 'regenerator-runtime/runtime';

// DevTools stores preferences between sessions in localStorage
if (!global.hasOwnProperty('localStorage')) {
  global.localStorage = storage;
}

// Mimic the global we set with Webpack's DefinePlugin
global.__DEV__ = process.env.NODE_ENV !== 'production';
