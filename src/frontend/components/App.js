/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import React from 'react';
import {Provider} from 'react-redux';
import {hot} from 'react-hot-loader';

import EnvironmentChooser from '../containers/EnvironmentChooser';
import Nav from '../containers/Nav';
import StoreExplorer from '../containers/StoreExplorer';
import UpdatesView from '../containers/UpdatesView';

function App({store}) {
  return (
    <Provider store={store}>
      <div style={containerStyle}>
        <EnvironmentChooser>
          <Nav />
          <StoreExplorer />
          <UpdatesView />
        </EnvironmentChooser>
      </div>
    </Provider>
  );
}

export default hot(module)(App);

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};
