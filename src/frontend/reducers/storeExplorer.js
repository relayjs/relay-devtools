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
import type {RecordDesc, SearchState} from './types';

type State = {
  history: {
    back: $ReadOnlyArray<SearchState>,
    forward: $ReadOnlyArray<SearchState>,
  },
  latest: SearchState,
  recordDescs: ?$ReadOnlyArray<RecordDesc>,
  recordDescsLoading: boolean,
};

const initialState = {
  history: {
    back: [],
    forward: [],
  },
  latest: {matchTerm: '', matchType: 'idtype'},
  recordDescs: null,
  selectedRecordId: null,
  recordDescsLoading: false,
};

export default function(state: State = initialState, action: Action): State {
  const {history} = state;

  switch (action.type) {
    case 'SWITCH_ENVIRONMENT':
      return initialState;
    case 'NEW_SEARCH':
      return {
        ...state,
        history: {
          back: [...history.back, state.latest],
          forward: [],
        },
        latest: action.newSearch,
      };
    case 'SELECT_RECORD':
      return {
        ...state,
        selectedRecordId: action.id,
      };

    // $FlowFixMe
    case 'LOAD_RECORD_DESCS_REQUEST':
      return {
        ...state,
        recordDescsLoading: true,
      };
    case 'LOAD_RECORD_DESCS_SUCCESS':
      return {
        ...state,
        // $FlowFixMe
        recordDescs: {
          // $FlowFixMe
          byId: {
            ...action.response,
          },
          // $FlowFixMe
          allIds: Object.keys(action.response),
        },
        recordDescsLoading: false,
      };

    default:
      return state;
  }
}
