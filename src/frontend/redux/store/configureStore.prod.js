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
import thunkMiddleware from 'redux-thunk';

import getAPIMiddleware from '../getAPIMiddleware';
import throwOnAsyncErrorMiddleware from '../throwOnAsyncErrorMiddleware';
import reducer from '../../reducers';

export default function configureStore(API) {
  const callAPIMiddleware = getAPIMiddleware(API);
  const middlewares = [
    callAPIMiddleware,
    throwOnAsyncErrorMiddleware,
    thunkMiddleware,
  ];
  return createStore(reducer, applyMiddleware(...middlewares));
}
