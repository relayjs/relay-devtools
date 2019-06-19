/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * This script installs the global Hook, which will later be used to look up
 * RelayEnvironment instances on the page. It also bootstraps a connection to
 * the Relay Devtools frontend, to communicate when a RelayEnvironment is found.
 *
 * It's important that this script remain lightweight, as it is installed on
 * every page load.
 */

'use strict';

import {installGlobalHook} from '../../../backend/GlobalHook';

let lastDetectionResult;
window.addEventListener('message', function(evt) {
  if (
    evt.source === window &&
    evt.data &&
    evt.data.source === 'relay-environment-detector'
  ) {
    lastDetectionResult = {
      hasDetectedRelay: true,
      environment: JSON.stringify(evt.data.environment),
    };
    // $FlowFixMe
    chrome.runtime.sendMessage(lastDetectionResult);
  }
});

// inject the hook
// if (document instanceof HTMLDocument) {
const detectRelayEnvironment = `
  window.__RELAY_DEVTOOLS_HOOK__.on('hasDetectedReact', function(evt) {
    window.postMessage({
      source: 'relay-environment-detector',
      environment: evt.environment,
    }, '*');
  });
  `;
const source =
  ';(' + installGlobalHook.toString() + '(window))' + detectRelayEnvironment;
const script = document.createElement('script');
script.textContent = source;
// $FlowFixMe
document.documentElement.appendChild(script);
// $FlowFixMe
script.parentNode.removeChild(script);
// }
