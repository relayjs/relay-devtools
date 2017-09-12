/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

import connectBackend from '../../../backend/connectBackend';
import createChromeBackendTransport from '../transport/createChromeBackendTransport';
import Bridge from '../../../transport/Bridge';
import { getGlobalHook } from '../../../backend/GlobalHook';

/**
 * This script is loaded into the document and is responsible for creating
 * a bridge, and connecting it to the backend via the relay global hook.
 */

const hook = getGlobalHook(window);
if (hook) {
  const transport = createChromeBackendTransport();
  const bridge = new Bridge(transport);
  connectBackend(hook, bridge);
}
