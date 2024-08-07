/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import typeof ReactTestRenderer from 'react-test-renderer';

export function act(callback: Function): void {
  const TestUtils = require('react-dom/test-utils');
  TestUtils.act(() => {
    callback();
  });

  // Flush Bridge operations
  TestUtils.act(() => {
    jest.runAllTimers();
  });
}

export async function actAsync(
  cb: () => mixed,
  recursivelyFlush: boolean = true
): Promise<void> {
  const TestUtils = require('react-dom/test-utils');

  // $FlowFixMe Flow doens't know about "await act()" yet
  await TestUtils.act(async () => {
    await cb();
  });

  if (recursivelyFlush) {
    while (jest.getTimerCount() > 0) {
      // $FlowFixMe Flow doens't know about "await act()" yet
      await TestUtils.act(async () => {
        jest.runAllTimers();
      });
    }
  } else {
    // $FlowFixMe Flow doesn't know about "await act()" yet
    await TestUtils.act(async () => {
      jest.runOnlyPendingTimers();
    });
  }
}

export function beforeEachProfiling(): void {
  // Mock React's timing information so that test runs are predictable.
  jest.mock('scheduler', () => jest.requireActual('scheduler/unstable_mock'));

  // DevTools itself uses performance.now() to offset commit times
  // so they appear relative to when profiling was started in the UI.
  jest
    .spyOn(performance, 'now')
    .mockImplementation(
      jest.requireActual('scheduler/unstable_mock').unstable_now
    );
}

export function getRendererID(): number {
  if (global.agent == null) {
    throw Error('Agent unavailable.');
  }
  const ids = Object.keys(global.agent._rendererInterfaces);
  if (ids.length !== 1) {
    throw Error('Multiple renderers attached.');
  }
  return parseInt(ids[0], 10);
}

export function requireTestRenderer(): ReactTestRenderer {
  let hook;
  try {
    // Hide the hook before requiring TestRenderer, so we don't end up with a loop.
    hook = global.__RELAY_DEVTOOLS_HOOK__;
    delete global.__RELAY_DEVTOOLS_HOOK__;

    return require('react-test-renderer');
  } finally {
    global.__RELAY_DEVTOOLS_HOOK__ = hook;
  }
}
