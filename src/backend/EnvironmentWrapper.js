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
  let pendingOperationsQueue = [];
  console.log('EnvironmentWrapper.attach');

  const originalExecute = environment.execute;
  environment.execute = (...args) => {
    console.log('instrumented environment.execute called with', args);
    if (pendingOperationsQueue !== null) {
      pendingOperationsQueue.push(args[0].operation.root.node.name);
    } else {
      hook.emit('Environment.execute', args[0].operation.root.node.name);
    }
    return originalExecute.apply(environment, args);
  };

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
    environment.execute = originalExecute;
  }

  function flushInitialOperations() {
    if (pendingOperationsQueue != null) {
      pendingOperationsQueue.forEach(pendingOperation => {
        hook.emit('Environment.execute', pendingOperation);
      });
      pendingOperationsQueue = null;
    }
  }

  return {
    cleanup,
    flushInitialOperations,
  };
}
