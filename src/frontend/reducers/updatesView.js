/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

'use strict';

import type {Action} from './actions';
import type {SplitType} from './types';

type State = {
  +events: ?$ReadOnlyArray<Event>,
  +selectedEvent: ?Event,
  +splitType: SplitType,
  +newNotifications: boolean,
};

const initialState = {
  events: null,
  selectedEvent: null,
  splitType: 'vertical',
  viewType: 'list',
  newNotifications: false,
};

export default function(state: State = initialState, action: Action) {
  switch (action.type) {
    case 'SWITCH_ENVIRONMENT':
      return initialState;
    // $FlowFixMe
    case 'LOAD_UPDATE_EVENTS_REQUEST':
      return {
        ...state,
        eventsLoading: true,
      };

    case 'LOAD_UPDATE_EVENTS_SUCCESS':
      if (!state.events || action.response.length > state.events.length) {
        return {
          ...state,
          events: action.response,
          newNotifications: true,
          eventsLoading: false,
        };
      }
      return {
        ...state,
        eventsLoading: false,
      };

    case 'SWITCH_TOOL':
      return action.tool === 'updates'
        ? {
            ...state,
            newNotifications: false,
          }
        : state;
    // $FlowFixMe
    case 'SWITCH_UPDATE_VIEW':
      return {
        ...state,
        viewType: action.viewType,
      };

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
