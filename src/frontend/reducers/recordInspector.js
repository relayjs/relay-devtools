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
  // fetchedRecords: {},
|};

export default function(
  state: State = {
    diffMode: 'inline',
    pathOpened: {},
    typeMapping: {},
    fetchedRecords: null
  },
  action: Action,
): State {
  switch (action.type) {
    case 'RECORD_INSPECTOR_CHANGE_DIFF_MODE':
      return {
        ...state,
        diffMode: action.diffMode,
      };

    case 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH':
      return {
        ...state,
        pathOpened: {
          ...state.pathOpened,
          [action.path]: action.open,
        },
      };

    case 'LOAD_TYPE_MAPPING_REQUEST':
      return {
        ...state,
        loadingTypeMapping: true,
      };

    case 'LOAD_TYPE_MAPPING_SUCCESS':
      const typeMapping = action.response;
      if (deepObjectEqual(state.typeMapping, typeMapping)) {
        return {
          ...state,
          loadingTypeMapping: false,
        };
      }
      return {
        ...state,
        typeMapping: {
          ...state.typeMapping,
          ...typeMapping,
        },
        loadingTypeMapping: false,
      };

    case 'LOAD_RECORD_REQUEST':
      return {
        ...state,
        loadingRecord: true,
      };
    case 'LOAD_RECORD_SUCCESS':
      if (action.response && !state.fetchedRecords?.byId[action?.response?.__id]) {
        return {
        ...state,
        fetchedRecords: {
          byId:{
            ...(state?.fetchedRecords?.byId ?? {}),
            [action.response.__id]: action.response,
          },
          allIds: (state?.fetchedRecords?.allIds ?? []).concat(
            action.response.__id
          )
        },
        loadingRecord: false,
      }
    }

    default:
      return state;
    }
  }
