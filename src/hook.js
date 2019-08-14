/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag.
 * That's why we have to inline the whole event emitter implementation here.
 *
 * @flow
 */

import type { DevToolsHook } from 'src/backend/types';

declare var window: any;

export function installHook(target: any): DevToolsHook | null {
  if (target.hasOwnProperty('__RELAY_DEVTOOLS_HOOK__')) {
    return null;
  }
  // TODO: More meaningful names for "rendererInterfaces" and "renderers".
  const listeners = {};
  const renderers = new Map();

  let uidCounter = 0;

  function registerEnvironment(renderer) {
    const id = ++uidCounter;
    renderers.set(id, renderer);

    hook.emit('renderer', { id, renderer });

    return id;
  }

  function sub(event, fn) {
    hook.on(event, fn);
    return () => hook.off(event, fn);
  }

  function on(event, fn) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!listeners[event]) {
      return;
    }
    const index = listeners[event].indexOf(fn);
    if (index !== -1) {
      listeners[event].splice(index, 1);
    }
    if (!listeners[event].length) {
      delete listeners[event];
    }
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].map(fn => fn(data));
    }
  }

  const hook: DevToolsHook = {
    registerEnvironment,
    // rendererInterfaces,
    // listeners,
    // renderers,

    emit,
    // inject,
    on,
    off,
    sub,
  };

  Object.defineProperty(
    target,
    '__RELAY_DEVTOOLS_HOOK__',
    ({
      // This property needs to be configurable for the test environment,
      // else we won't be able to delete and recreate it beween tests.
      configurable: __DEV__,
      enumerable: false,
      get() {
        return hook;
      },
    }: Object)
  );

  return hook;
}
