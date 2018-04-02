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

import type {
  DiffMode,
  Environment,
  Record,
  RecordDesc,
  SearchState,
  SplitType,
  Tool,
  TypeMapping,
} from './types';

type RecordInspectorChangeDiffModeAction = {|
  +type: 'RECORD_INSPECTOR_CHANGE_DIFF_MODE',
  +diffMode: DiffMode,
|};

type RecordInspectorOpenOrClosePathAction = {|
  +type: 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH',
  +open: boolean,
  +path: string,
|};

type LoadTypeMappingSuccessAction = {|
  +type: 'LOAD_TYPE_MAPPING_SUCCESS',
  +response: TypeMapping,
|};

type LoadRecordSuccessAction = {|
  +type: 'LOAD_RECORD_SUCCESS',
  +response: Record,
|};

type NewNotificationAction = {|
  +type: 'NEW_NOTIFICATION',
  +tool: Tool,
|};

type SwitchToolAction = {|
  +type: 'SWITCH_TOOL',
  +tool: Tool,
|};

type LoadUpdateEventsSuccessAction = {|
  +type: 'LOAD_UPDATE_EVENTS_SUCCESS',
  +response: $ReadOnlyArray<Event>,
|};

type UpdatesViewClearEventsAction = {|
  +type: 'UPDATES_VIEW_CLEAR_EVENTS',
|};

type UpdatesViewSelectEventAction = {|
  +type: 'UPDATES_VIEW_SELECT_EVENT',
  +event: Event,
|};

type UpdatesViewChangeSplitTypeAction = {|
  +type: 'UPDATES_VIEW_CHANGE_SPLIT_TYPE',
  +splitType: SplitType,
|};

type NewSearchAction = {|
  +type: 'NEW_SEARCH',
  +newSearch: SearchState,
|};

type SearchGoBackAction = {|
  +type: 'SEARCH_GO_BACK',
  +currentSearch: SearchState,
|};

type SearchGoForwardAction = {|
  +type: 'SEARCH_GO_FORWARD',
  +currentSearch: SearchState,
|};

type LoadRecordDescsSuccessAction = {|
  +type: 'LOAD_RECORD_DESCS_SUCCESS',
  +response: $ReadOnlyArray<RecordDesc>,
|};

type SwitchEnvironmentAction = {|
  +type: 'SWITCH_ENVIRONMENT',
  +environment: Environment,
|};

type LoadEnvironmentsSuccessAction = {|
  +type: 'LOAD_ENVIRONMENTS_SUCCESS',
  +response: $ReadOnlyArray<Environment>,
|};

export type Action =
  | RecordInspectorChangeDiffModeAction
  | RecordInspectorOpenOrClosePathAction
  | LoadTypeMappingSuccessAction
  | LoadRecordSuccessAction
  | NewNotificationAction
  | SwitchToolAction
  | LoadUpdateEventsSuccessAction
  | UpdatesViewClearEventsAction
  | UpdatesViewSelectEventAction
  | UpdatesViewChangeSplitTypeAction
  | NewSearchAction
  | SearchGoBackAction
  | SearchGoForwardAction
  | LoadRecordDescsSuccessAction
  | SwitchEnvironmentAction
  | LoadEnvironmentsSuccessAction;
