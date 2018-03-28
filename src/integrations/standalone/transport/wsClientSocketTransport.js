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
 * Creates a WebSocket based BridgeTransport for use on the client, which can
 * be used to connect a Relay environment in a Browser that does not have a
 * debugging console, or in a React Native simulator.
 *
 * The WebSocket passed in must be initially open.
 */
export default function wsClientSocketTransport(socket): BridgeTransport {
  const messageListeners = [];

  socket.onmessage = handleMessage;

  const transport = {
    listen(fn) {
      messageListeners.push(fn);
    },
    send(message) {
      sendMessage(message);
    },
  };

  return transport;

  function handleMessage(evt) {
    let data;
    try {
      data = JSON.parse(evt.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Relay DevTools: Failed to parse message: ' + evt.data);
    }
    if (data) {
      const message = data.relayDevTools;
      if (message) {
        messageListeners.forEach(fn => fn(message));
      }
    }
  }

  function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({relayDevTools: message}));
    }
  }
}
