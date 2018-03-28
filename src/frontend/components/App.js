/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

import '../css/global.css';

import {Provider} from 'react-redux';
import EnvironmentChooser from '../containers/EnvironmentChooser';
import Tools from '../containers/Tools';

export default function App({store}) {
  return (
    <Provider store={store}>
      <div className="relay-devtools">
        <EnvironmentChooser>
          <Tools />
        </EnvironmentChooser>
      </div>
    </Provider>
  );
}
