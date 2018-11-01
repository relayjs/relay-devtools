/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import "@babel/polyfill";

import * as DevtoolsUI from './DevtoolsUI';

const container = document.getElementById('container');

DevtoolsUI.setContentDOMNode(container);
DevtoolsUI.startServer(process.env.PORT);
