#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const electron = require('electron');
const spawn = require('cross-spawn');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const argv = process.argv.slice(2);

// notify if there's an update
updateNotifier({ pkg }).notify({ defer: false });

const result = spawn.sync(electron, [require.resolve('./main')].concat(argv), {
  stdio: 'ignore',
});
process.exit(result.status);
