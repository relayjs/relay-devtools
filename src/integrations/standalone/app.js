/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import * as DevtoolsUI from './DevtoolsUI';

const container = document.getElementById('container');

DevtoolsUI.setContentDOMNode(container);
DevtoolsUI.startServer(process.env.PORT);
