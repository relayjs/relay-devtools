/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
