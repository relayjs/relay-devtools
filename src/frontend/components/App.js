/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {hot} from 'react-hot-loader';

import '../css/global.css';

import {Provider} from 'react-redux';

import Search from './Search';
import Filter from '../containers/Filter';
import Nav from '../containers/Nav';
import Tools from '../containers/Tools';
import StoreExplorer from '../containers/StoreExplorer';
import UpdatesView from '../containers/UpdatesView';
import EditVariables from '../containers/EditVariables';
import RecordInspector from './RecordInspector';
import EnvironmentChooser from '../containers/EnvironmentChooser';
// import SnapshotRecordInspector from '../containers/SnapshotRecordInspector';

// const tools = {
//   environment: EnvironmentChooser,
//   store: StoreExplorer,
//   updates: UpdatesView,
// };
function handleChange(e) {
  console.log('e', e.target.value);
}

function App({store}) {
  return (
    <Provider store={store}>
      <div className="relay-devtools">
        <div
          style={{
            position: 'relative',
            height: '25px',
            flexDirection: 'row-reverse',
            background: '#f5f5f5',
            border: 'solid 1px #ddd',
            padding: '3px',
            // borderTop: '1px solid black',
            // borderBottom: '1px solid black',
            display: 'flex',
          }}>
          <Nav
            renderEnvironmentChooser={() => (
              <EnvironmentChooser>Environment</EnvironmentChooser>
            )}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
          <UpdatesView>
            <Filter onChange={handleChange} />
          </UpdatesView>

          {/* <StoreExplorer />
          <RecordInspector />
          <SnapshotRecordInspector /> */}
        </div>

        <div>
          <EditVariables />
        </div>

        {/* <Search /> */}

        {/* <Tools />
        </EnvironmentChooser> */}
      </div>
    </Provider>
  );
}

export default hot(module)(App);
