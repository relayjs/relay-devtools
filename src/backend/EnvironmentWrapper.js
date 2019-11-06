// @flow

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
    console.log('[devtools]', event);
    if (pendingEventsQueue !== null) {
      pendingEventsQueue.push(event);
    } else {
      hook.emit('environment.event', event);
    }
  };

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
    // $FlowFixMe
    environment.__log = originalLog;
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
