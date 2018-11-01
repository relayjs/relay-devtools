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
};

export default function(
  state: State = {
    history: {
      back: [],
      forward: [],
    },
    latest: {matchTerm: '', matchType: 'idtype'},
    recordDescs: null,
    selectedRecordId: null,
  },
  action: Action,
): State {
  const {history} = state;

  switch (action.type) {
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

    case 'LOAD_RECORD_DESCS_REQUEST':
      return {
        ...state,
        recordDescsLoading: true,
      };
    case 'LOAD_RECORD_DESCS_SUCCESS':
      return {
        ...state,
        recordDescs: {
          byId: {
            ...action.response,
          },
          allIds: Object.keys(action.response),
        },
        recordDescsLoading: false,
      };

    default:
      return state;
  }
}
