/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
  DevToolsHook,
  RelayEnvironment,
  EnvironmentWrapper,
} from './types';

export function attach(
  hook: DevToolsHook,
  rendererID: number,
  environment: RelayEnvironment,
  global: Object
): EnvironmentWrapper {
  let pendingEventsQueue = [];

  // $FlowFixMe
  const originalLog = environment.__log;
  // $FlowFixMe
  environment.__log = event => {
    originalLog(event);
    if (pendingEventsQueue !== null) {
      pendingEventsQueue.push(event);
    } else {
      hook.emit('environment.event', event);
    }
  };

  const store = environment.getStore();
  const originalPublish = store.publish.bind(store);
  store.publish = (...args) => {
    const result = originalPublish(...args);

    const records = store.getSource().toJSON();
    hook.emit('environment.event', { name: 'store.updated', records });

    return result;
  };

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
    // $FlowFixMe
    environment.__log = originalLog;
    store.publish = originalPublish;
  }

  function flushInitialOperations() {
    if (pendingEventsQueue != null) {
      pendingEventsQueue.forEach(pendingEvent => {
        hook.emit('environment.event', pendingEvent);
      });
      pendingEventsQueue = null;
    }
  }

  return {
    cleanup,
    flushInitialOperations,
  };
}
