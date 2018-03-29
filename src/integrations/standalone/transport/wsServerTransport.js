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

import * as WebSocket from 'ws';

/**
 * Creates a WebSocket based BridgeTransport, which can be used to connect to
 * a Relay instance in a Browser that does not have a debugging console, or in
 * a React Native simulator.
 *
 * The resulting Promise will resolve when a client WebSocket connection
 * successfully connects.
 */
export default function wsServerTransport(
  port: number = 8734,
): Promise<BridgeTransport> {
  return new Promise((resolve, reject) => {
    let connection;
    let reconnect;
    const messageListeners = [];

    startServer();

    function startServer() {
      try {
        const httpServer = require('http').createServer();
        const wsServer = new WebSocket.Server({server: httpServer});
        wsServer.on('connection', handleConnection);
        wsServer.on('error', handleServerError);
        httpServer.on('error', handleServerError);
        httpServer.listen(port, () => {
          // eslint-disable-next-line no-console
          console.log('Now listening on port: ' + port);
        });
      } catch (error) {
        reject(error);
      }
    }

    function handleConnection(newConnection) {
      if (connection) {
        connection.close();
      }
      connection = newConnection;
      connection.on('close', handleClose);
      connection.on('error', handleError);
      connection.on('message', handleMessage);
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

    function handleServerError(error) {
      // eslint-disable-next-line no-console
      console.error('WebSocketTransport: server error', error);
      connection = null;
      attemptRestart();
    }

    function attemptRestart() {
      if (!reconnect) {
        reconnect = setTimeout(() => {
          reconnect = null;
          startServer();
        }, 2000);
      }
    }

    function handleClose() {
      connection = null;
    }

    function handleError(error) {
      // eslint-disable-next-line no-console
      console.error('WebSocketTransport: connection error', error);
      connection = null;
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
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({relayDevTools: message}));
      }
    }
  });
}
