/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {enableBatching, batchDispatchMiddleware} from 'redux-batched-actions';

import getAPIMiddleware from '../getAPIMiddleware';
import throwOnAsyncErrorMiddleware from '../throwOnAsyncErrorMiddleware';
import reducer from '../../reducers';

// $FlowFixMe
export default function configureStore(API) {
  const callAPIMiddleware = getAPIMiddleware(API);
  const middleware = [
    callAPIMiddleware,
    throwOnAsyncErrorMiddleware,
    thunkMiddleware,
    batchDispatchMiddleware,
  ];
  return createStore(enableBatching(reducer), applyMiddleware(...middleware));
}
