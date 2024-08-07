/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type { BackendBridge, FrontendBridge } from 'src/bridge';

const env = jasmine.getEnv();
env.beforeEach(() => {
  // These files should be required (and re-reuired) before each test,
  // rather than imported at the head of the module.
  // That's because we reset modules between tests,
  // which disconnects the DevTool's cache from the current dispatcher ref.
  const Agent = require('src/backend/agent').default;
  const { initBackend } = require('src/backend');
  const Bridge = require('src/bridge').default;
  const Store = require('src/devtools/store').default;
  const { installHook } = require('src/hook');

  // Fake timers let us flush Bridge operations between setup and assertions.
  jest.useFakeTimers();

  const originalConsoleError = console.error;
  // $FlowFixMe
  console.error = (...args) => {
    if (args[0] === 'Warning: Relay DevTools encountered an error: %s') {
      // Rethrow errors from React.
      throw args[1];
    }
    originalConsoleError.apply(console, args);
  };

  installHook(global);

  const bridgeListeners = [];
  const bridge = new Bridge<any, any>({
    listen(callback) {
      bridgeListeners.push(callback);
      return () => {
        const index = bridgeListeners.indexOf(callback);
        if (index >= 0) {
          bridgeListeners.splice(index, 1);
        }
      };
    },
    sendAll(events) {
      bridgeListeners.forEach(callback => callback(events));
    },
  });

  const agent = new Agent(((bridge: any): BackendBridge));

  const hook = global.__RELAY_DEVTOOLS_HOOK__;

  initBackend(hook, agent, global);

  const store = new Store(((bridge: any): FrontendBridge));

  global.agent = agent;
  global.bridge = bridge;
  global.store = store;
});
env.afterEach(() => {
  delete global.__RELAY_DEVTOOLS_HOOK__;

  // It's important to reset modules between test runs;
  // Without this, ReactDOM won't re-inject itself into the new hook.
  // It's also important to reset after tests, rather than before,
  // so that we don't disconnect the ReactCurrentDispatcher ref.
  jest.resetModules();
});
