/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

declare var chrome: any;

window.addEventListener('message', e => {
  if (e.source === window && e.data.relayDetected) {
    chrome.runtime.sendMessage({message: e.data});
  }
});

function detect(win) {
  setTimeout(() => {
    // Method 1: Check Relay
    const relayDetected = Boolean(window.__RELAY_DEVTOOLS_HOOK__);
    if (relayDetected) {
      win.postMessage(
        {
          devtoolsEnabled: true,

          relayDetected: true,
        },
        '*',
      );

      return false;
    }
  }, 100);
}

// inject the hook
// $FlowFixMe
if (document instanceof HTMLDocument) {
  installScript(detect);
}

function installScript(fn) {
  const source = ';(' + fn.toString() + ')(window)';
  const script = document.createElement('script');
  script.textContent = source;
  // $FlowFixMe
  document.documentElement.appendChild(script);
  // $FlowFixMe
  script.parentNode.removeChild(script);
}
