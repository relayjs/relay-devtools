/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default function(
  state = {
    events: [],
    selectedEvent: null,
    splitType: 'vertical',
    newNotifications: false,
  },
  action,
) {
  switch (action.type) {
    case 'LOAD_UPDATE_EVENTS_SUCCESS':
      if (!state.events || action.response.length > state.events.length) {
        return {
          ...state,
          events: action.response,
          newNotifications: true,
        };
      }
      return state;

    case 'UPDATES_VIEW_CLEAR_EVENTS':
      return {
        ...state,
        events: [],
        selectedEvent: null,
      };

    case 'UPDATES_VIEW_SELECT_EVENT':
      return {
        ...state,
        selectedEvent: action.event,
      };

    case 'UPDATES_VIEW_CHANGE_SPLIT_TYPE':
      return {
        ...state,
        splitType: action.splitType,
      };

    default:
      return state;
  }
}
