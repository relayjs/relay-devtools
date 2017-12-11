/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

import React from 'react';
import * as ReactDOM from 'react-dom';

import 'font-awesome-webpack!./font-awesome.config.js';
import '../../frontend/css/reset.css';

import wsServerTransport from './transport/wsServerTransport';
import wsServerSocketTransport from './transport/wsServerSocketTransport';
import Bridge from '../../transport/Bridge';

import API from '../../frontend/api/BridgeAPI';
import setupRedux from '../../frontend/redux/setupRedux';
import App from '../../frontend/components/App';
import RelayDetector from '../../frontend/components/RelayDetector.js';

let node = null;
export function startServer(port) {
  return wsServerTransport(port).then(transport => {
    const bridge = new Bridge(transport);
    const api = new API(bridge);
    const store = setupRedux(api);

    ReactDOM.render(
      <RelayDetector API={api}>
        <App store={store} />
      </RelayDetector>,
      node,
    );
  });
}

export function setContentDOMNode(_node) {
  node = _node;
}

export function connectToSocket(socket) {
  const transport = wsServerSocketTransport(socket);
  const bridge = new Bridge(transport);
  const api = new API(bridge);
  const store = setupRedux(api);

  ReactDOM.render(
    <RelayDetector API={api}>
      <App store={store} />
    </RelayDetector>,
    node,
  );

  return {
    close() {
      ReactDOM.unmountComponentAtNode(node);
      node.innerHTML =
        '<div id="waiting"><h2>Waiting for Relay to connect…</h2></div>';
    },
  };
}
