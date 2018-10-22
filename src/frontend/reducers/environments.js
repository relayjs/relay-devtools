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
    environmentList: [],
    environments: [],
    currentEnvironment: null,
  },
  action: Action,
): State {
  switch (action.type) {
    case 'SWITCH_ENVIRONMENT':
      return {
        environments: state.environments,
        currentEnvironment: action.environment,
        environmentList: state.environmentList,
      };

    case 'LOAD_ENVIRONMENTS_SUCCESS':
      const environments = action.response;
      return {
        environments,
        currentEnvironment: environments[0],
      };
    case 'LOAD_ENVIRONMENT_SUCCESS':
      const environmentList = action.response;
      return {
        environments: state.environments,
        currentEnvironment: state.currentEnvironment,
        environmentList: JSON.parse(environmentList),
      };

    default:
      return state;
  }
}
