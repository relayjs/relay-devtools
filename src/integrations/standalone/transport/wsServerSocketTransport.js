/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

'use strict';

import type {BridgeTransport} from '../../../transport/Bridge';

/**
 * Creates a WebSocket based BridgeTransport, which can be used to connect to
 * a Relay instance in a Browser that does not have a debugging console, or in
 * a React Native simulator.
 *
 * The WebSocket passed in must be initially open.
 */
export default function wsServerSocketTransport(
  socket: $FlowFixMe,
): BridgeTransport {
  const messageListeners = [];

  socket.onclose = handleClose;
  socket.onerror = handleError;
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

  function handleClose() {
    // eslint-disable-next-line no-console
    console.log('WebSocketTransport: connection closed');
  }

  function handleError(error) {
    // eslint-disable-next-line no-console
    console.error('WebSocketTransport: connection error', error);
  }

  function handleMessage(rawMessage) {
    let data;
    try {
      data = JSON.parse(rawMessage);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WebSocketTransport: failed to parse: ' + rawMessage);
    }
    // $FlowFixMe
    const message = data.relayDevTools;
    if (message) {
      messageListeners.forEach(fn => fn(message));
    }
  }

  function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({relayDevTools: message}));
    }
  }
}
