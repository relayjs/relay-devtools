/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default function persistEnhancer(paths, key) {
  return next => (reducer, initialState, enhancer) => {
    /* eslint-disable no-param-reassign */
    if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
      enhancer = initialState;
      initialState = undefined;
    }

    if (!initialState) {
      initialState = reducer(initialState, { type: '@@INIT' });
    }
    /* eslint-enable no-param-reassign */

    let persistedState;
    let hydratedState;

    try {
      persistedState = JSON.parse(localStorage.getItem(key));
      hydratedState = merge(initialState, persistedState);
    } catch (e) {
      /* eslint-disable no-console */
      console.warn('Failed to retrieve initialize state from localStorage:', e);
      /* eslint-enable no-console */
    }

    const store = next(reducer, hydratedState, enhancer);

    store.subscribe(() => {
      const state = store.getState();
      const subset = extract(state, paths);

      try {
        localStorage.setItem(key, JSON.stringify(subset));
      } catch (e) {
        /* eslint-disable no-console */
        console.warn('Unable to persist state to localStorage:', e);
        /* eslint-enable no-console */
      }
    });

    return store;
  };
}

function merge(state, persisted) {
  Object.keys(persisted).forEach(path => {
    let target = state;
    const pathComps = path.split('.');
    const key = pathComps[pathComps.length - 1];
    pathComps.slice(0, pathComps.length - 1).forEach(k => {
      target = target[k];
    });

    target[key] = persisted[path];
  });

  return state;
}

function extract(state, paths) {
  const persisted = {};
  paths.forEach(path => {
    let target = state;
    const pathComps = path.split('.');
    const key = pathComps[pathComps.length - 1];
    pathComps.slice(0, pathComps.length - 1).forEach(k => {
      target = target[k];
    });

    persisted[path] = target[key];
  });

  return persisted;
}
