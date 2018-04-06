/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

declare var chrome: any;

/**
 * Because Chrome content scripts cannot directly access the JavaScript context,
 * but can access the DOM, the global Hook is installed by injecting a script
 * tag into the document (the head element is not created at this moment).
 */
const script = document.createElement('script');
script.src = chrome.extension.getURL('globalHook.js');
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

/**
 * Proxy messages between the browser window's postMessage API and the
 * ContentScript's chrome runtime messaging API.
 */
const port = chrome.runtime.connect({name: 'relayDevtoolsBackend'});

port.onMessage.addListener(sendMessageToBackend);
port.onDisconnect.addListener(handleDisconnect);
window.addEventListener('message', handleMessageFromBackend);

function sendMessageToBackend(message) {
  window.postMessage({source: 'relayDevtoolsFrontend', message}, '*');
}

function handleMessageFromBackend(evt) {
  if (
    evt.source === window &&
    evt.data &&
    evt.data.source === 'relayDevtoolsBackend'
  ) {
    port.postMessage(evt.data.message);
  }
}

function handleDisconnect() {
  window.removeEventListener('message', sendMessageToBackend);
  sendMessageToBackend({type: 'event', name: 'disconnect'});
}
