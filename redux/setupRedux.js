/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

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
        ['mutationsView.splitType', 'recordInspector.diffMode'],
        'RELAY_DEVTOOLS',
      ),
    ),
  );
}
