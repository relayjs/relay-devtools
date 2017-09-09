/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import createChromeFrontendTransport from '../transport/createChromeFrontendTransport';

declare var chrome: any;

// Set up a command channel with the backgroundMessageBus which has access
// to the full chrome devtools API.
const devtoolsCommand = chrome.runtime.connect({
  name: 'relayDevtoolsCommand',
});
function executeScript(file) {
  devtoolsCommand.postMessage({
    command: 'executeScript',
    args: {
      tabId: chrome.devtools.inspectedWindow.tabId,
      file,
    },
  });
}

// Set up a transport to talk to the "backend" browser window.
const transport = createChromeFrontendTransport();
transport.listen(msg => {
  if (msg.type === 'event' && msg.name === 'detectedRelayEnvironment') {
    // When a Relay environment is detected, add the backendAgent to the browser
    // window, and create the Relay devtools panel.
    executeScript('injectBackendAgent.js');
    chrome.devtools.panels.create(
      'Relay',
      'imgs/logo.png',
      'devtoolsPanel.html',
    );
  }
});
