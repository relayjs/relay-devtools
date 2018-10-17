/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'remote-redux-devtools';

import reducer from '../reducers';

import getAPIMiddleware from './getAPIMiddleware';
import throwOnAsyncErrorMiddleware from './throwOnAsyncErrorMiddleware';
import persistEnhancer from './persistEnhancer';

const composeEnhancers = composeWithDevTools({realtime: true});
export default function setupRedux(API) {
  const callAPIMiddleware = getAPIMiddleware(API);
  return createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(callAPIMiddleware, throwOnAsyncErrorMiddleware),
      persistEnhancer(
        ['updatesView.splitType', 'recordInspector.diffMode'],
        'RELAY_DEVTOOLS',
      ),
    ),
  );
}
