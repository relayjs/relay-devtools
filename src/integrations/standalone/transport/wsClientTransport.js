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

/**
 * Creates a WebSocket based BridgeTransport for use on the client, which can
 * be used to connect a Relay environment in a Browser that does not have a
 * debugging console, or in a React Native simulator.
 *
 * The resulting Promise will resolve when a WebSocket connection is
 * successfully connected.
 */
export default function wsClientTransport(
  host: string,
  port: number,
): Promise<BridgeTransport> {
  return new Promise((resolve, reject) => {
    let connection;
    let reconnect;
    const messageListeners = [];

    connect();

    function connect() {
      try {
        connection = new WebSocket(`ws://${host}:${port}`);
        connection.onopen = handleOpen;
        connection.onclose = handleClose;
        connection.onerror = handleError;
        connection.onmessage = handleMessage;
      } catch (error) {
        reject(error);
      }
    }

    function handleOpen() {
      const transport = {
        listen(fn) {
          messageListeners.push(fn);
        },
        send(message) {
          sendMessage(message);
        },
      };
      resolve(transport);
    }

    function handleClose() {
      connection = null;
      attemptReconnect();
    }

    function handleError(error) {
      // eslint-disable-next-line no-console
      console.error('WebSocketTransport: connection error', error);
      connection = null;
      attemptReconnect();
    }

    function attemptReconnect() {
      if (!reconnect) {
        reconnect = setTimeout(() => {
          reconnect = null;
          connect();
        }, 2000);
      }
    }

    function handleMessage(evt) {
      try {
        const data = JSON.parse(evt.data);
        const message = data.relayDevTools;
        if (message) {
          messageListeners.forEach(fn => fn(message));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('WebSocketTransport: failed to parse: ' + evt.data);
      }
    }

    function sendMessage(message) {
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({ relayDevTools: message }));
      }
    }
  });
}
