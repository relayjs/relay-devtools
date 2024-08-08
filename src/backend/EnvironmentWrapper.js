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

const UNUSED_EXPENSIVE_FIELDS = [
  'selector',
  'sourceOperation',
  'updatedOwners',
  'operation',
  'profilerContext',
];

const SUPPORTED_EVENTS = new Set([
  'queryresource.fetch',
  'network.info',
  'store.publish',
  'store.gc',
  'store.restore',
  'store.snapshot',
  'store.notify.start',
  'store.notify.complete',
  'network.info',
  'network.start',
  'network.next',
  'network.error',
  'network.complete',
  'network.unsubscribe',
]);

function sanitizeEvent(event: Object): Object {
  // Convert some common data structures to objects or arrays
  // Remove unused Relay data structures
  const newEvent: Object = {};
  const keys = Object.keys(event);
  for (const key of keys) {
    const value = event[key];
    if (typeof value === 'function' || UNUSED_EXPENSIVE_FIELDS.includes(key)) {
      continue;
    } else if (value == null) {
      newEvent[key] = value;
    } else if (typeof value !== 'object') {
      newEvent[key] = value;
    } else if (value instanceof Map) {
      newEvent[key] = Object.fromEntries((value: Map<mixed, mixed>));
    } else if (value instanceof Set) {
      newEvent[key] = Array.from(value);
    } else if (typeof value.toJSON == 'function') {
      // Convert RecordSource to Object, there are arbitary values for resolvers
      newEvent[key] = JSON.parse(JSON.stringify(value.toJSON()));
    } else if (
      (key === 'info' && event.name === 'network.info') ||
      key === 'cacheConfig'
    ) {
      // Network info contains arbitary data
      newEvent[key] = JSON.parse(JSON.stringify(value));
    } else {
      newEvent[key] = value;
    }
  }
  return newEvent;
}

export function attach(
  hook: DevToolsHook,
  rendererID: number,
  environment: RelayEnvironment,
  global: Object
): EnvironmentWrapper {
  let pendingEventsQueue: Array<any> | null = [];
  const store = environment.getStore();

  const originalLog = environment.__log;
  environment.__log = event => {
    originalLog(event);
    if (!SUPPORTED_EVENTS.has(event.name)) {
      return;
    }
    const sanitizedEvent = sanitizeEvent(event);
    // TODO(damassart): Make this a modular function
    if (pendingEventsQueue !== null) {
      pendingEventsQueue.push(sanitizedEvent);
    } else {
      hook.emit('environment.event', {
        id: rendererID,
        data: sanitizedEvent,
        eventType: 'environment',
      });
    }
  };

  const storeOriginalLog = store.__log;
  // TODO(damassart): Make this cleaner
  store.__log = event => {
    if (storeOriginalLog !== null) {
      storeOriginalLog(event);
    }
    if (!SUPPORTED_EVENTS.has(event.name)) {
      return;
    }
    const sanitizedEvent = sanitizeEvent(event);
    hook.emit('environment.event', {
      id: rendererID,
      data: sanitizedEvent,
      eventType: 'store',
    });
  };

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
    environment.__log = originalLog;
    store.__log = storeOriginalLog;
  }

  function sendStoreRecords() {
    const records = JSON.parse(JSON.stringify(store.getSource().toJSON()));
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
    sendStoreRecords();
  }

  return {
    cleanup,
    sendStoreRecords,
    flushInitialOperations,
  };
}
