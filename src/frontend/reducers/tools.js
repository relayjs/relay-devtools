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

import type {Action} from './actions';
import type {Tool} from './types';

type State = {
  currentTool: Tool,
  notifications: {
    store: number,
    updates: number,
  },
};

export default function(
  state: State = {
    currentTool: 'store',
    notifications: {store: 0, updates: 0},
  },
  action: Action,
): State {
  switch (action.type) {
    case 'NEW_NOTIFICATION':
      const tool = action.tool;
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [tool]: state.notifications[tool] + 1,
        },
      };

    case 'SWITCH_TOOL':
      return {
        currentTool: action.tool,
        notifications: {
          ...state.notifications,
          [action.tool]: 0,
        },
      };

    default:
      return state;
  }
}
