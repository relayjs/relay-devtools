/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import React from 'react';
import { render } from 'react-dom';
import 'font-awesome-webpack';
import 'babel-polyfill';

import '../../../frontend/css/reset.css';

import createChromeFrontendTransport from '../transport/createChromeFrontendTransport';
import Bridge from '../../../transport/Bridge';

import API from '../../../frontend/api/BridgeAPI';
import setupRedux from '../../../frontend/redux/setupRedux';
import App from '../../../frontend/components/App.js';
import RelayDetector from '../../../frontend/components/RelayDetector.js';

const transport = createChromeFrontendTransport();
const bridge = new Bridge(transport);
const api = new API(bridge);
const store = setupRedux(api);

render(
  <RelayDetector API={api}>
    <App store={store} />
  </RelayDetector>,
  document.getElementById('devtools-root'),
);
