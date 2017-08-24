/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ws from 'ws';
const http = require('http');

import './css/reset.css';

import api from './api';
import setupRedux from './redux/setupRedux';
import App from './components/App';
import { Bridge } from '../react-native-runtime/src/bridge';

export function start(node, port) {
  startServer(port, wall => {
    const bridge = new Bridge(wall);
    const API = new api(bridge);
    const store = setupRedux(API);

    ReactDOM.render(<App store={store} />, node);
  });
}

function startServer(port, cb) {
  const httpServer = http.createServer();
  const server = new ws.Server({ server: httpServer });

  /* eslint-disable no-console */
  server.on('connection', socket => {
    console.log('new connection');
    socket.onerrror = err => {
      console.log('RN Connection Error', err.message);
    };
    socket.onclose = () => {
      console.log('RN Connection Closed');
    };

    const listeners = [];
    socket.onmessage = evt => {
      const data = JSON.parse(evt.data);
      listeners.forEach(fn => fn(data));
    };

    const wall = {
      listen(fn) {
        listeners.push(fn);
      },
      send(data) {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(data));
        }
      },
      disconnect() {
        socket.close();
      },
    };

    cb(wall);
  });
  httpServer.listen(port, () => {
    console.log('listening on port', port);
  });
}
