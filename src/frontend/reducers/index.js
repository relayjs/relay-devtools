/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {combineReducers} from 'redux';
import tools from './tools';
import environments from './environments';
import storeExplorer from './storeExplorer';
import updatesView from './updatesView';
import recordInspector from './recordInspector';

export default combineReducers({
  tools,
  environments,
  storeExplorer,
  updatesView,
  recordInspector,
});
