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

import type {BridgeTransport} from '../../../transport/Bridge';

/**
 * Creates a BridgeTransport for use in the backend of a Chrome plugin, which
 * communicates via PostMessage to a ContentScript, through a Background script
 * which is connected to the Devtools frontend.
 */
export default function createChromeBackendTransport(): BridgeTransport {
  const messageListeners = [];
  window.addEventListener('message', handleMessage);

  function handleMessage(event) {
    if (
      event.source === window &&
      event.data &&
      event.data.source === 'relayDevtoolsFrontend'
    ) {
      const message = event.data.message;
      if (message) {
        messageListeners.forEach(fn => fn(message));
      }
    }
  }

  return {
    listen(fn) {
      messageListeners.push(fn);
    },
    send(message) {
      window.postMessage({source: 'relayDevtoolsBackend', message}, '*');
    },
  };
}
