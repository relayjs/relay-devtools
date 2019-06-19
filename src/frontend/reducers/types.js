/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

export type DiffMode = 'inline';

export type Environment = String;

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
