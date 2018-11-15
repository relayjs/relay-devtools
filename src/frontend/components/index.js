/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

import 'babel-polyfill';
import '../css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import API from '../api/BridgeAPI';
import setupRedux from '../redux/setupRedux';
import App from '../components/App';
import RelayDetector from '../components/RelayDetector.js';

const connectFrontend = (node, bridge) => {
  const api = new API(bridge);
  const store = setupRedux(api);

  ReactDOM.render(
    <RelayDetector API={api}>
      <App store={store} />
    </RelayDetector>,
    node,
  );
};

export default connectFrontend;
