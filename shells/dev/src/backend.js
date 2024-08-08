/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import Agent from 'src/backend/agent';
import Bridge from 'src/bridge';
import { initBackend } from 'src/backend';
import type { WallEvent } from 'src/types';

const bridge = new Bridge<any, any>({
  listen(fn) {
    const listener = (event: any) => {
      fn(event.data);
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  },
  sendAll(events: Array<WallEvent>) {
    window.parent.postMessage(events, '*');
  },
});

const agent = new Agent(bridge);

initBackend(window.__RELAY_DEVTOOLS_HOOK__, agent, window.parent);
