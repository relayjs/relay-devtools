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
      hook.emit('environment.event', {
        id: rendererID,
        data: event,
      });
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
        hook.emit('environment.event', {
          id: rendererID,
          envName: environment.configName,
          data: pendingEvent,
        });
      });
      pendingEventsQueue = null;
    }
  }

  return {
    cleanup,
    flushInitialOperations,
  };
}
