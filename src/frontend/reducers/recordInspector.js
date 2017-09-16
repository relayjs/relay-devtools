/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { deepObjectEqual } from '../util/objCompare';

export default function(
  state = {
    diffMode: 'inline',
    pathOpened: {},
    typeMapping: {},
    fetchedRecords: {},
  },
  action,
) {
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

    case 'LOAD_TYPE_MAPPING_SUCCESS':
      const typeMapping = action.response;

      if (deepObjectEqual(state.typeMapping, typeMapping)) {
        return state;
      }

      return {
        ...state,
        typeMapping,
      };

    case 'LOAD_RECORD_SUCCESS':
      return {
        ...state,
        fetchedRecords: {
          ...state.fetchedRecords,
          [action.response.__id]: action.response,
        },
      };

    default:
      return state;
  }
}
