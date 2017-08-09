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

import './css/reset.css';
import './css/global.css';
import 'font-awesome/css/font-awesome.css';

import App from './components/App.js';
import RelayDetector from './components/RelayDetector.js';

render(
  <RelayDetector>
    <App />
  </RelayDetector>,
  document.getElementById('devtools-root'),
);
