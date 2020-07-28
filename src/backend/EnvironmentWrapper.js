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
  const store = environment.getStore();

  const originalLog = environment.__log;
  environment.__log = event => {
    originalLog(event);
    // TODO(damassart): Make this a modular function
    if (pendingEventsQueue !== null) {
      pendingEventsQueue.push(event);
    } else {
      hook.emit('environment.event', {
        id: rendererID,
        data: event,
        eventType: 'environment',
      });
    }
  };

  const storeOriginalLog = store.__log;
  store.__log = event => {
    if (storeOriginalLog !== null) {
      storeOriginalLog(event);
    }
    if (event.name === 'store.publish') {
      hook.emit('environment.event', {
        id: rendererID,
        data: event,
        eventType: 'store',
      });
    } else if (event.name === 'store.restore') {
      hook.emit('environment.event', {
        id: rendererID,
        data: event,
        eventType: 'store',
      });
    }
  };

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
    environment.__log = originalLog;
    store.__log = storeOriginalLog;
  }

  function sendStoreRecords() {
    const records = store.getSource().toJSON();
    hook.emit('environment.store', {
      name: 'refresh.store',
      id: rendererID,
      records,
    });
  }

  function flushInitialOperations() {
    // TODO(damassart): Make this a modular function
    if (pendingEventsQueue != null) {
      pendingEventsQueue.forEach(pendingEvent => {
        hook.emit('environment.event', {
          id: rendererID,
          envName: environment.configName,
          data: pendingEvent,
          eventType: 'environment',
        });
      });
      pendingEventsQueue = null;
    }
    this.sendStoreRecords();
  }

  return {
    cleanup,
    sendStoreRecords,
    flushInitialOperations,
  };
}
