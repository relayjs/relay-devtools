/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {Path} from './types';

export function stringifyPath(path: Path) {
  return path.map(e => e.id).join('/');
}
