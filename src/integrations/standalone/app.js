/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import 'babel-polyfill';

import * as DevtoolsUI from './DevtoolsUI';

const container = document.getElementById('container');

DevtoolsUI.setContentDOMNode(container);
DevtoolsUI.startServer(process.env.PORT);
