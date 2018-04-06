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
import type {Tool} from './types';

type State = {|
  currentTool: Tool,
|};

export default function(
  state: State = {currentTool: 'store'},
  action: Action,
): State {
  switch (action.type) {
    case 'SWITCH_TOOL':
      return {
        currentTool: action.tool,
      };

    default:
      return state;
  }
}
