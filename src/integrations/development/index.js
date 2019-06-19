/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {render} from 'react-dom';
import 'font-awesome-webpack';

import '../../frontend/css/reset.css';

import configureStore from '../../frontend/redux/configureStore';
import App from '../../frontend/components/App.js';
import RelayDetector from '../../frontend/components/RelayDetector.js';
import DevelMockAPI from './DevelMockAPI.js';

const api = new DevelMockAPI();
const store = configureStore(api);

render(
  <RelayDetector API={api}>
    <App store={store} />
  </RelayDetector>,
  document.getElementById('devtools-root'),
);
