/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Hook:
 *
 * Responsible for installing itself as a global variable which Relay
 * Environment instances will look for to register themselves, and which
 * connectBackend will use to find environments.
 */

'use strict';

import type {Environment} from 'relay-runtime';

export type GlobalHook = {
  /**
   * Called by RelayEnvironment during initialization.
   */
  registerEnvironment(environment: Environment): void,

  /**
   * Called by Relay Devtools to get currently detected Relay Environments,
   * in case Relay initializes before Devtools.
   */
  getEnvironments(): Array<Environment>,

  /**
   * Called by Relay Devtools to subscribe to future detected Relay
   * Environments, in case Devtools initializes before Relay.
   */
  onEnvironment(listener: (Environment) => mixed): void,
};

export function installGlobalHook(window: any): boolean {
  if (!window || window.__RELAY_DEVTOOLS_HOOK__) {
    return false;
  }
  const environments = [];
  const listeners = [];

  const hook: GlobalHook = {

    registerEnvironment(environment) {
      environments.push(environment);
      listeners.forEach(listener => listener(environment));
    },

    getEnvironments() {
      return environments;
    },

    onEnvironment(listener) {
      listeners.push(listener);
    },
  };

  Object.defineProperty(window, '__RELAY_DEVTOOLS_HOOK__', {
    value: hook,
  });

  return true;
}

export function getGlobalHook(window: any): ?GlobalHook {
  return window && window.__RELAY_DEVTOOLS_HOOK__;
}
