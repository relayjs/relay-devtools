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

import type {Environment} from './types';

type State = {|
  +environments: $ReadOnlyArray<Environment>,
  +currentEnvironment: ?Environment,
|};

export default function(
  state: State = {
    environments: null,
    currentEnvironment: null,
    environmentsDetails: null,
  },
  action: Action,
): State {
  switch (action.type) {
    case 'SWITCH_ENVIRONMENT':
      return {
        ...state,
        currentEnvironment: action.environment,
      };

    case 'LOAD_ENVIRONMENTS_REQUEST':
      return {
        ...state,
        environmentsLoading: true,
      };

    case 'LOAD_ENVIRONMENTS_SUCCESS':
      const environments = action.response;
      return {
        ...state,
        environments,
        currentEnvironment: environments[0],
        environmentsLoading: false,
      };

    case 'LOAD_ENVIRONMENTS_DETAILS_REQUEST':
      return {
        ...state,
        environmentsDetailsLoading: true,
      };
    case 'LOAD_ENVIRONMENTS_DETAILS_SUCCESS':
      return {
        ...state,
        environmentsDetails: action.response,
        environmentsDetailsLoading: false,
      };

    default:
      return state;
  }
}
