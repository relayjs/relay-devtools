/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 *
 * Because Chrome content scripts cannot directly access the JavaScript context,
 * but can access the DOM, the global Hook is installed by injecting a script
 * tag into the document (the head element is not created at this moment).
 */

'use strict';

// declare var chrome: any;
/**
 * Proxy messages between the browser window's postMessage API and the
 * ContentScript's chrome runtime messaging API.
 */
const port = chrome.runtime.connect({name: 'content-script'});

port.onMessage.addListener(sendMessageToBackend);
window.addEventListener('message', sendMessageToDevtools);
port.onDisconnect.addListener(handleDisconnect);

sendMessageToBackend('init');

function sendMessageToBackend(payload) {
  window.postMessage({
    source: 'relay-devtools-proxy',
    payload
  },'*');
}

function sendMessageToDevtools(event) {
  if (event.data && event.data.source === 'relay-devtools-backend') {
    port.postMessage(event.data.payload);
  }
}

function handleDisconnect() {
  sendMessageToBackend({type: 'event', name: 'shutdown'});
  window.removeEventListener('message', sendMessageToDevtools);
}
