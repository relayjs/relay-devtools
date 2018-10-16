/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import createChromeFrontendTransport from '../transport/createChromeFrontendTransport';
import connectFrontend from '../../../frontend/components';
import Bridge from '../../../transport/Bridge';
//
const CONTAINER = document.getElementById('devtools-root');
const transport = createChromeFrontendTransport();
const bridge = new Bridge(transport);
connectFrontend(CONTAINER, bridge);
