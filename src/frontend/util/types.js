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

type PathItem = {|
  +id: string,
  +name: string,
|};

export type Path = $ReadOnlyArray<PathItem>;
