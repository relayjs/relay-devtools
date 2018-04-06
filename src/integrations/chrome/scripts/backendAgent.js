/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import connectBackend from '../../../backend/connectBackend';
import createChromeBackendTransport from '../transport/createChromeBackendTransport';
import Bridge from '../../../transport/Bridge';
import {getGlobalHook} from '../../../backend/GlobalHook';

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
