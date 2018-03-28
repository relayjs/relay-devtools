/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import refetchActionsReducers from '../refetch-actions-reducers';

export default function getAPIMiddleware(API) {
  let subscribedEnvironment = null;

  return function callAPIMiddleware({dispatch, getState}) {
    return next => action => {
      const {
        type,
        types,
        callAPI,
        shouldCallAPI = () => true,
        payload = {},
      } = action;

      if (type === 'ENVIRONMENT_SUBSCRIBE') {
        const {environment} = action;

        const callback = () => {
          refetchActionsReducers(getState()).forEach(dispatch);
        };

        if (subscribedEnvironment === environment) {
          return;
        }

        if (subscribedEnvironment) {
          API.stopObservingChange({environment: subscribedEnvironment});
          callback();
        }

        subscribedEnvironment = environment;

        API.onChange({environment, callback});
        return;
      }

      const environment = getState().environments.currentEnvironment;

      if (!types) {
        // A one-off call
        if (typeof callAPI === 'function') {
          callAPI(API, environment);
          next(action);
        }

        // Normal action: pass it on
        return next(action);
      }

      if (
        !Array.isArray(types) ||
        types.length !== 3 ||
        !types.every(t => typeof t === 'string')
      ) {
        throw new Error('Expected an array of three string types.');
      }

      if (typeof callAPI !== 'function') {
        throw new Error('Expected callAPI to be a function.');
      }

      if (!shouldCallAPI(getState())) {
        return;
      }

      const [requestType, successType, failureType] = types;

      dispatch({
        ...payload,
        type: requestType,
      });

      return callAPI(API, environment).then(
        response => {
          dispatch({
            ...payload,
            response,
            type: successType,
          });
        },
        error =>
          dispatch({
            ...payload,
            error,
            type: failureType,
          }),
      );
    };
  };
}
