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

import type {BridgeTransport} from './Bridge';

/**
 * Creates a PostMessage based BridgeTransport, which can be used to connect to
 * a Relay instance in a Browser from a debugging console, or in an iframe.
 *
 * The resulting Promise will resolve immediately.
 */
export default function createPostMessageBridgeTransport(
  sourceWindow: any,
): Promise<BridgeTransport> {
  return new Promise((resolve, reject) => {
    if (!sourceWindow || typeof sourceWindow.postMessage !== 'function') {
      return reject(
        new Error(
          'createPostMessageBridgeTransport: must provide sourceWindow.',
        ),
      );
    }

    if (
      typeof window !== 'object' ||
      typeof window.addEventListener !== 'function'
    ) {
      reject(
        new Error(
          'createPostMessageBridgeTransport: must be in a DOM context.',
        ),
      );
    }

    const messageListeners = [];
    window.addEventListener('message', handleMessage);

    const transport = {
      listen(fn) {
        messageListeners.push(fn);
      },
      send(message) {
        sendMessage(message);
      },
    };
    resolve(transport);

    function handleMessage(event) {
      if (event.source === sourceWindow && event.data) {
        const message = event.data.relayDebuggerMessage;
        if (message) {
          messageListeners.forEach(fn => fn(message));
        }
      }
    }

    function sendMessage(message) {
      sourceWindow.postMessage({relayDebuggerMessage: message}, '*');
    }
  });
}
