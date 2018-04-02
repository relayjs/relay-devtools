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

import type {Environment} from './types';

type State = {|
  +environments: $ReadOnlyArray<Environment>,
  +currentEnvironment: ?Environment,
|};

export default function(
  state: State = {
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
      };

    case 'LOAD_ENVIRONMENTS_SUCCESS':
      const environments = action.response;
      return {
        environments,
        currentEnvironment: environments[0],
      };

    default:
      return state;
  }
}
