/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { combineReducers } from 'redux';
import tools from './tools';
import environments from './environments';
import storeExplorer from './storeExplorer';
import mutationsView from './mutationsView';
import recordInspector from './recordInspector';

const combinedReducers = combineReducers({
  tools,
  environments,
  storeExplorer,
  mutationsView,
  recordInspector,
});

export default function(state, action) {
  const newState = combinedReducers(state, action);

  // A hack to propagate new notifications from one part of state to another in
  // the same reducer run
  if (newState.mutationsView.newNotifications) {
    newState.tools = tools(newState.tools, {
      type: 'NEW_NOTIFICATION',
      tool: 'mutations',
    });

    return {
      ...newState,
      mutationsView: {
        ...newState.mutationsView,
        newNotifications: false,
      },
    };
  }

  return newState;
}
