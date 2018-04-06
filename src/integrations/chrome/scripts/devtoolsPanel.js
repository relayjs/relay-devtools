/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import React from 'react';
import {render} from 'react-dom';
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
