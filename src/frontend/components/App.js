/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
