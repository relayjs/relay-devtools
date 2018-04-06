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
  },
  action: Action,
): State {
  const {history} = state;
  let newMatch;

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

    case 'SEARCH_GO_BACK':
      newMatch = history.back[history.back.length - 1];
      return {
        ...state,
        history: {
          back: history.back.slice(0, history.back.length - 1),
          forward: [...history.forward, action.currentSearch],
        },
        latest: newMatch,
      };

    case 'SEARCH_GO_FORWARD':
      newMatch = history.forward[history.forward.length - 1];
      return {
        ...state,
        history: {
          back: [...history.back, action.currentSearch],
          forward: history.forward.slice(0, history.forward.length - 1),
        },
        latest: newMatch,
      };

    case 'LOAD_RECORD_DESCS_SUCCESS':
      return {
        ...state,
        recordDescs: action.response,
      };

    default:
      return state;
  }
}
