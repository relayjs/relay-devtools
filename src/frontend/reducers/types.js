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

export type DiffMode = 'inline';

export type Environment = $FlowFixMe;

export type Record = {|
  +__id: string,
  +[key: string]: mixed,
|};

export type RecordDesc = {|
  +TODO: 'xxx',
|};

export type SearchState = {|
  matchTerm: string,
  matchType: 'idtype',
|};

export type TypeMapping = {
  +[id: string]: string,
};

export type Tool = 'store' | 'updates';

export type Event = {|
  +tbd: 'XXX',
|};

export type SplitType = 'TODO' | 'vertical';
