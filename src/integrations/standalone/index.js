/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

import installGlobalHook from '../../backend/installGlobalHook';
import connectBackend from '../../backend/connectBackend';
import Bridge from '../../transport/Bridge';
import wsClientTransport from './transport/wsClientTransport';

/**
 * Install the Relay DevTools backend in your application code so it can be
 * inspected with Relay DevTools standalone app.
 *
 * Ensure this function is called *before* creating a Relay Environment.
 *
 * By default, this will look for the Relay DevTools app at localhost:8098,
 * however both the port and host can be configured.
 */
export function installRelayDevTools(
  port: number = 8098,
  host: string = 'localhost',
): void {
  // eslint-disable-next-line no-console
  console.log(
    'Installing Relay DevTools backend. Inspect Relay Environments in this ' +
      'app by running `relay-devtools`. Remember to remove this in production!',
  );
  installGlobalHook(global);
  wsClientTransport(host, port).then(transport => {
    const bridge = new Bridge(transport);
    const hook = global.__RELAY_DEVTOOLS_HOOK__;
    connectBackend(hook, bridge);
  });
}
