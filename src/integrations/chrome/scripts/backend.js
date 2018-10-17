/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Creates a BridgeTransport for use in the backend of a Chrome plugin, which
 * communicates via PostMessage to a ContentScript, through a Background script
 * which is connected to the Devtools frontend.
 */

// BACKEND CONTENT SCRIPT

'use strict';

import connectBackend from '../../../backend/connectBackend';
import Bridge from '../../../transport/Bridge';

window.addEventListener('message', handshake);

function handshake(e) {
  if (e.data.source === 'relay-devtools-proxy' && e.data.payload === 'init') {
    window.removeEventListener('message', handshake);

    let listeners = [];
    const bridge = new Bridge({
      listen(fn) {
        const listener = evt => {
          if (evt.data.source === 'relay-devtools-proxy' && evt.data.payload) {
            fn(evt.data.payload);
          }
        };
        window.addEventListener('message', listener);
        listeners.push(listener);
      },
      send(data) {
        window.postMessage({
          source: 'relay-devtools-backend',
          payload: data,
        }, '*');
      },
    });

    bridge.on('shutdown', () => {
      listeners.forEach(l => {
        window.removeEventListener('message', l);
      });
      listeners = [];
    });

    connectBackend(bridge);
  }
}
