/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default function(
  state = { currentTool: 'store', notifications: {} },
  { type, tool },
) {
  switch (type) {
    case 'NEW_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [tool]: (state[tool] || 0) + 1,
        },
      };

    case 'SWITCH_TOOL':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [tool]: 0,
        },
        currentTool: tool,
      };

    default:
      return state;
  }
}
