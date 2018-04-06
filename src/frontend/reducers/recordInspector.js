/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {deepObjectEqual} from '../util/objCompare';

import type {DiffMode, TypeMapping} from './types';
import type {Action} from './actions';

type State = {|
  diffMode: DiffMode,
  pathOpened: {+[path: string]: boolean},
  typeMapping: TypeMapping,
  fetchedRecords: {},
|};

export default function(
  state: State = {
    diffMode: 'inline',
    pathOpened: {},
    typeMapping: {},
    fetchedRecords: {},
  },
  action: Action,
): State {
  switch (action.type) {
    case 'RECORD_INSPECTOR_CHANGE_DIFF_MODE':
      return {
        diffMode: action.diffMode,
        fetchedRecords: state.fetchedRecords,
        pathOpened: state.pathOpened,
        typeMapping: state.typeMapping,
      };

    case 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH':
      return {
        diffMode: state.diffMode,
        fetchedRecords: state.fetchedRecords,
        pathOpened: {
          ...state.pathOpened,
          [action.path]: action.open,
        },
        typeMapping: state.typeMapping,
      };

    case 'LOAD_TYPE_MAPPING_SUCCESS':
      const typeMapping = action.response;
      if (deepObjectEqual(state.typeMapping, typeMapping)) {
        return state;
      }
      return {
        diffMode: state.diffMode,
        fetchedRecords: state.fetchedRecords,
        pathOpened: state.pathOpened,
        typeMapping,
      };

    case 'LOAD_RECORD_SUCCESS':
      return {
        diffMode: state.diffMode,
        fetchedRecords: {
          ...state.fetchedRecords,
          [action.response.__id]: action.response,
        },
        pathOpened: state.pathOpened,
        typeMapping: state.typeMapping,
      };

    default:
      return state;
  }
}
