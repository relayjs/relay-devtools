/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { inDevMode } from './util';

// require('util').format-like interface that escapes arguments before eval
/* global chrome:false */
export default (async function inspectedEval(templateString, ...args) {
  return new Promise((resolve, reject) => {
    if (inDevMode()) {
      reject(new Error('Cannot eval while developing devtool.'));
    } else {
      chrome.devtools.inspectedWindow.eval(
        format(templateString, args),
        (res, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        },
      );
    }
  });
});

function format(fmt, args) {
  if (!args.length) {
    return fmt;
  }

  return fmt.replace(/(%([%jds]))/g, match => {
    switch (match) {
      case '%s':
        return JSON.stringify(String(args.shift()));
      case '%d':
        return JSON.stringify(Number(args.shift()));
      case '%j':
        return JSON.stringify(args.shift());
      case '%%':
        return '%';
      default:
        throw new Error('No match');
    }
  });
}
