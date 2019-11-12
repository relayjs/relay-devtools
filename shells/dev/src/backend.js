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

const bridge = new Bridge({
  listen(fn) {
    const listener = event => {
      fn(event.data);
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  },
  send(event: string, payload: any, transferable?: Array<any>) {
    window.parent.postMessage({ event, payload }, '*', transferable);
  },
});

const agent = new Agent(bridge);

initBackend(window.__RELAY_DEVTOOLS_HOOK__, agent, window.parent);
