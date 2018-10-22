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

import * as GlobalHook from '../../backend/GlobalHook';
import connectBackend from '../../backend/connectBackend';
import Bridge from '../../transport/Bridge';
import wsClientTransport from './transport/wsClientTransport';
import wsClientSocketTransport from './transport/wsClientSocketTransport';

/**
 * Install the Relay DevTools backend in your application code so it can be
 * inspected with Relay DevTools standalone app.
 *
 * Ensure this function is called *before* creating a Relay Environment.
 *
 * By default, this will look for the Relay DevTools app at localhost:8734,
 * however both the port and host can be configured.
 */
export function installRelayDevTools(
  port?: number,
  host?: string,
  prompt?: string,
): void {
  if (prompt !== null) {
    // eslint-disable-next-line no-console
    console.log(
      prompt ||
        'Installing Relay DevTools backend. Inspect Relay Environments in ' +
          'this app by running `relay-devtools`. Remember to remove this ' +
          'in production!',
    );
  }
  if (GlobalHook.installGlobalHook(global)) {
    wsClientTransport(host, port).then(
      transport => {
        const hook = GlobalHook.getGlobalHook(global);
        if (hook) {
          const bridge = new Bridge(transport);
          // $FlowFixMe
          connectBackend(hook, bridge);
        }
      },
      error => {
        // Assuming having `prompt` means "verbose"
        if (prompt !== null) {
          // eslint-disable-next-line no-console
          console.error('Failed to initialize WebSocket transport', error);
        }
      },
    );
  }
}

export function connectToBackendWithSocket(socket: $FlowFixMe) {
  const hook = GlobalHook.getGlobalHook(global);
  if (hook) {
    const transport = wsClientSocketTransport(socket);
    const bridge = new Bridge(transport);
    // $FlowFixMe
    connectBackend(hook, bridge);
  }
}

export function prepareRelayDevTools() {
  if (!GlobalHook.getGlobalHook(global)) {
    GlobalHook.installGlobalHook(global);
  }
}
