/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import { render } from 'react-dom';
import 'font-awesome-webpack';

import '../../frontend/css/reset.css';

import setupRedux from '../../frontend/redux/setupRedux';
import App from '../../frontend/components/App.js';
import RelayDetector from '../../frontend/components/RelayDetector.js';
import DevelMockAPI from './DevelMockAPI.js';

const api = new DevelMockAPI();
const store = setupRedux(api);

render(
  <RelayDetector API={api}>
    <App store={store} />
  </RelayDetector>,
  document.getElementById('devtools-root'),
);
