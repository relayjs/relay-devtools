/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

      chrome.devtools.panels.create(
        'Relay',
        'imgs/logo.png',
        'devtools.html',
        function(panel) {
          panel.onShown.addListener(function(window) {
            console.log(
              '[devtools-background.js] panel.onShown.addListener invoked',
            );
          });
          panel.onHidden.addListener(function() {
            console.log(
              '[devtools-background.js] panel.onShown.onHidden invoked',
            );
          });
        },
      );
    },
  );
}

chrome.runtime.onMessage.addListener(request => {
  console.log(
    `[devtools-background] chrome.runtime.onMessage.addListener ${JSON.stringify(
      request,
    )}`,
  );
});

chrome.devtools.network.onNavigated.addListener(createPanelIfHasRelay);

const checkRelayInterval = setInterval(createPanelIfHasRelay, 1000);

createPanelIfHasRelay();
console.log('nice');
