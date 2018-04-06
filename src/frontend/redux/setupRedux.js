/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import reducer from '../reducers';

import getAPIMiddleware from './getAPIMiddleware';
import throwOnAsyncErrorMiddleware from './throwOnAsyncErrorMiddleware';
import persistEnhancer from './persistEnhancer';

export default function setupRedux(API) {
  const callAPIMiddleware = getAPIMiddleware(API);
  return createStore(
    reducer,
    composeWithDevTools(
      applyMiddleware(callAPIMiddleware, throwOnAsyncErrorMiddleware),
      persistEnhancer(
        ['updatesView.splitType', 'recordInspector.diffMode'],
        'RELAY_DEVTOOLS',
      ),
    ),
  );
}
