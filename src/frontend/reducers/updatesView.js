/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Action} from './actions';
import type {SplitType} from './types';

type State = {
  +events: $ReadOnlyArray<Event>,
  +selectedEvent: ?Event,
  +splitType: SplitType,
  +newNotifications: boolean,
};

export default function(
  state: State = {
    events: [],
    selectedEvent: null,
    splitType: 'vertical',
    newNotifications: false,
    filter: '',
  },
  action: Action,
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

    case 'SWITCH_TOOL':
      return action.tool === 'updates'
        ? {
            ...state,
            newNotifications: false,
          }
        : state;

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
    case 'UPDATE_FILTER':
      return {
        ...state,
        filter: action.filter,
      };

    default:
      return state;
  }
}
