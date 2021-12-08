/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { TabID } from './devtools/views/DevTools';

export type LogEvent =
  | {|
      +event_name: 'loaded-dev-tools',
    |}
  | {|
      +event_name: 'selected-tab',
      +extra: TabID, // selected tab
    |}
  | {|
      +event_name: 'selected-store-tab',
      +extra: string, // selected tab
    |};

export type LogFunction = LogEvent => void;

let logFunctions: Array<LogFunction> = [];
export function logEvent(event: LogEvent): void {
  logFunctions.forEach(log => {
    log(event);
  });
}

export function registerEventLogger(logFunction: LogFunction): () => void {
  logFunctions.push(logFunction);
  return function unregisterEventLogger() {
    logFunctions = logFunctions.filter(log => log !== logFunction);
  };
}
