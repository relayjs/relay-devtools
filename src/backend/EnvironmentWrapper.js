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

const CIRCULAR_REFERENCE = '[Circular]';
const UNCLONEABLE_VALUE = '[Uncloneable]';
const DROPPED_SUBTREE_WARNING = 'makeCloneable: dropped uncloneable subtree';

function isUncloneable(value: mixed, path: string): boolean {
  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'undefined'
  ) {
    return true;
  }
  try {
    return typeof Node === 'function' && value instanceof Node;
  } catch (error) {
    console.warn(`${DROPPED_SUBTREE_WARNING} at ${path}`, error);
    return true;
  }
}

function sanitizeEvent(event: Object): Object {
  // Convert some common data structures to objects or arrays
  // Remove unused Relay data structures
  const newEvent: Object = {};
  const keys = Object.keys(event);
  keys.forEach(key => {
    const value = event[key];
    const path = `event[${JSON.stringify(key)}]`;
    if (isUncloneable(value, path) || UNUSED_EXPENSIVE_FIELDS.includes(key)) {
      return;
    }
    newEvent[key] = makeCloneable(value, new WeakSet(), path);
  });
  return newEvent;
}

function makeCloneable(
  obj: mixed,
  ancestors: WeakSet<Object> = new WeakSet(),
  path: string = 'records'
): mixed {
  if (isUncloneable(obj, path)) {
    return null;
  }
  if (typeof obj === 'bigint') {
    return String(obj);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (ancestors.has(obj)) {
    return CIRCULAR_REFERENCE;
  }

  ancestors.add(obj);
  let currentPath = path;
  try {
    if (Array.isArray(obj)) {
      return obj.map((value: mixed, index: number) =>
        makeCloneable(value, ancestors, `${path}[${index}]`)
      );
    }
    if (obj instanceof Map) {
      const result: Array<[mixed, mixed]> = [];
      const map: Map<mixed, mixed> = (obj: any);
      map.forEach((value: mixed, key: mixed) => {
        const entryPath = `${path}[${result.length}]`;
        result.push([
          makeCloneable(key, ancestors, `${entryPath}[0]`),
          makeCloneable(value, ancestors, `${entryPath}[1]`),
        ]);
      });
      return result;
    }
    if (obj instanceof Set) {
      const set: Set<mixed> = (obj: any);
      return Array.from(set, (value: mixed, index: number) =>
        makeCloneable(value, ancestors, `${path}[${index}]`)
      );
    }

    // Convert RecordSource to Object, there are arbitrary values for resolvers.
    if (typeof obj.toJSON === 'function') {
      // $FlowFixMe[incompatible-use]
      return makeCloneable(obj.toJSON(), ancestors, path);
    }

    const result: Object = {};
    Object.keys(obj).forEach(key => {
      currentPath = `${path}[${JSON.stringify(key)}]`;
      const value = obj[key];
      if (!isUncloneable(value, currentPath)) {
        Object.defineProperty(result, key, {
          configurable: true,
          enumerable: true,
          value: makeCloneable(value, ancestors, currentPath),
          writable: true,
        });
      }
    });
    return result;
  } catch (error) {
    console.warn(`${DROPPED_SUBTREE_WARNING} at ${currentPath}`, error);
    return UNCLONEABLE_VALUE;
  } finally {
    ancestors.delete(obj);
  }
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
    const cloneableRecords = makeCloneable(store.getSource().toJSON());
    let records;
    if (cloneableRecords !== null && typeof cloneableRecords === 'object') {
      records = cloneableRecords;
    } else {
      console.warn(
        'sendStoreRecords: unable to clone store records; emitting empty records',
        { environmentName: environment.configName, rendererID }
      );
      records = {};
    }
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
