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

import EnvironmentChooser from './components/EnvironmentChooser';
import StoreExplorer from './components/StoreExplorer';

render(
  <EnvironmentChooser><StoreExplorer /></EnvironmentChooser>,
  document.getElementById('devtools-root')
);
