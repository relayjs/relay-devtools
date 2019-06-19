/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Inits Relay Devtools and creates tab/panel in chrome dev tools
 */

'use strict';

let created = false;
declare var chrome: any;

function createPanelIfHasRelay() {
  if (created) {
    return;
  }
  chrome.devtools.inspectedWindow.eval(
    '!!(window.__RELAY_DEVTOOLS_HOOK__)',
    function(hasRelay) {
      if (!hasRelay || created) {
        return;
      }
      clearInterval(checkRelayInterval);
      created = true;

      chrome.devtools.panels.create('Relay', 'imgs/logo.png', 'devtools.html');
    },
  );
}

chrome.devtools.network.onNavigated.addListener(createPanelIfHasRelay);

const checkRelayInterval = setInterval(createPanelIfHasRelay, 1000);

createPanelIfHasRelay();
