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
import thunkMiddleware from 'redux-thunk';
import reduxUnhandledAction from 'redux-unhandled-action';
import {createLogger} from 'redux-logger';

import rootReducer from '../../reducers';
import getAPIMiddleware from '../getAPIMiddleware';
import throwOnAsyncErrorMiddleware from '../throwOnAsyncErrorMiddleware';
// import persistEnhancer from './persistEnhancer';

const composeEnhancers = composeWithDevTools({realtime: true});

const callback = action => {
  console.error(
    `${JSON.stringify(action)}
didn't lead to creation of a
new state object`,
  );
};

const logger = createLogger({
  diff: true,
});

export default function configureStore(API) {
  const callAPIMiddleware = getAPIMiddleware(API);
  const middleware = [
    thunkMiddleware,
    callAPIMiddleware,
    throwOnAsyncErrorMiddleware,
    require('redux-immutable-state-invariant').default(),
    reduxUnhandledAction(callback),
    logger,
  ];
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  if (module.hot) {
    console.log('module.hot');
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../../reducers', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
