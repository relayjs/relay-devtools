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

import type { BridgeTransport } from '../../../transport/Bridge';

declare var chrome: any;

/**
 * Creates a BridgeTransport for use in the frontend of a Chrome plugin, which
 * communicates via Chrome messaging API, through a Background script
 * which is connected to the Devtools backend via a ContentScript.
 */
export default function createChromeFrontendTransport(): BridgeTransport {
  const name = 'relayDevtoolsFrontend:' + chrome.devtools.inspectedWindow.tabId;
  const port = chrome.runtime.connect({ name });

  const messageListeners = [];
  port.onMessage.addListener(handleMessage);

  function handleMessage(message) {
    messageListeners.forEach(fn => fn(message));
  }

  return {
    listen(fn) {
      messageListeners.push(fn);
    },
    send(message) {
      port.postMessage(message);
    },
  };
}
