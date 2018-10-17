#!/usr/bin/env node
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const chromeLauncher = require('chrome-launcher');
const path = require('path');

const TEST_URL = 'http://localhost:3000/';
const EXTENSION_PATH = path.resolve(__dirname, '../../lib/chrome');

chromeLauncher
  .launch({
    startingUrl: TEST_URL,
    enableExtensions: true,
    chromeFlags: [
      `--load-extension=${EXTENSION_PATH}`,
      "--enable-extensions=true",
      "--disable-default-apps=false",
      "--disable-sync=false"
    ],
    logLevel: 'verbose',
    // userDataDir: true,
  })
  .then(chrome => {
    // eslint-disable-next-line no-console
    console.log(
      `Opening browser to ${TEST_URL}, assuming you're running relay-examples/todo`
    );
    // eslint-disable-next-line no-console
    console.log(`Chrome debugging port running on http://localhost:${chrome.port}/`);

    chromeFlags: [`--load-extension=${EXTENSION_PATH}`],
    logLevel: 'verbose',
  });
