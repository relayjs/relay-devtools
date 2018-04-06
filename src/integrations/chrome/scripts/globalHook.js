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

import {installGlobalHook} from '../../../backend/GlobalHook';
import createChromeBackendTransport from '../transport/createChromeBackendTransport';

/**
 * This script installs the global Hook, which will later be used to look up
 * RelayEnvironment instances on the page. It also bootstraps a connection to
 * the Relay Devtools frontend, to communicate when a RelayEnvironment is found.
 *
 * It's important that this script remain lightweight, as it is installed on
 * every page load.
 */

if (installGlobalHook(window)) {
  const transport = createChromeBackendTransport();

  let foundEnvironment = false;
  function detectedRelayEnvironment() {
    if (!foundEnvironment) {
      foundEnvironment = true;
      // $FlowFixMe
      transport.send({type: 'event', name: 'detectedRelayEnvironment'});
    }
  }

  transport.listen(msg => {
    if (msg.type === 'event' && msg.name === 'connect') {
      if (window.__RELAY_DEVTOOLS_HOOK__.getEnvironments().length) {
        detectedRelayEnvironment();
      }
      window.__RELAY_DEVTOOLS_HOOK__.onEnvironment(detectedRelayEnvironment);
    }
  });
}
