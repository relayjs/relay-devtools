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

// let panelLoaded = false;
// let panelShown = false;
// let pendingAction;
let created = false;
// const checkCount = 0;
//  || checkCount++ > 10\
declare var chrome: any;

function createPanelIfHasRelay() {
  if (created) {
    // double check logic
    return;
  }
  // panelLoaded = false;
  // panelShown = false;
  chrome.devtools.inspectedWindow.eval(
    '!!(window.__RELAY_DEVTOOLS_HOOK__)',
    function(hasRelay) {
      if (!hasRelay || created) {
        return;
      }
      clearInterval(checkRelayInterval);
      created = true;
      // create the Relay devtools panel.
      // chrome.devtools.panels.create('Relay', '', 'devtools.html', panel => {
      //   panel.onShown.addListener(onPanelShown);
      //   panel.onHidden.addListener(onPanelHidden);
      // });
      chrome.devtools.panels.create(
        'Relay',
        'imgs/logo.png',
        'devtools.html',
        function(panel) {
          // let reactPanel = null;
          panel.onShown.addListener(function() {
            // when the user switches to the panel, check for an elements tab
            // selection
            // window.panel.getNewSelection();
            // reactPanel = window.panel;
            // reactPanel.resumeTransfer();
          });
          panel.onHidden.addListener(function() {
            // if (reactPanel) {
            //   reactPanel.hideHighlight();
            //   reactPanel.pauseTransfer();
            // }
          });
        },
      );
    },
  );
}

// chrome.app.runtime.onLaunched.addListener(function() {
//   console.log('launch');
//   // chrome.app.window.create('scan.html', {
//   //   singleton: true,
//   //   id: "ChromeApps-Sample-Document-Scan",
//   //   bounds: {
//   //    'width': 480,
//   //    'height': 640
//   //   }
//   // });
// });

chrome.runtime.onMessage.addListener(request => {
  // console.log('chrome.runtime.onMessage.addListener', request);
  // console.log(
  //   'devtools-background--chrome.runtime.onMessage.addListener',
  //   request,
  // );
  if (request === 'relay-panel-load') {
    onPanelLoad();
  }
  // else if (request.relayContextMenu) {
  //   onContextMenu(request.relayContextMenu)
  // }
});

// function onContextMenu ({ id }) {
//   if (id === 'relay-inspect-instance') {
//     const src = `window.__RELAY_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__`
//
//     chrome.devtools.inspectedWindow.eval(src, function (res, err) {
//       if (err) {
//         console.log(err)
//       }
//       if (typeof res !== 'undefined' && res) {
//         panelAction(() => {
//           chrome.runtime.sendMessage('relay-get-context-menu-target')
//         }, 'Open Relay devtools to see component details')
//       } else {
//         pendingAction = null
//         // toast('No Relay component was found', 'warn')
//       }
//     })
//   }
// }

chrome.devtools.network.onNavigated.addListener(createPanelIfHasRelay);

const checkRelayInterval = setInterval(createPanelIfHasRelay, 1000);

createPanelIfHasRelay();

// function panelAction(cb, message = null) {
//   if (created && panelLoaded && panelShown) {
//     cb();
//   } else {
//     pendingAction = cb;
//     // message && toast(message)
//   }
// }
//
// function executePendingAction() {
//   pendingAction && pendingAction();
//   pendingAction = null;
// }
//
function onPanelLoad() {
  // executePendingAction();
  // panelLoaded = true;
}
//
function onPanelShown() {
  chrome.runtime.sendMessage({message: 'relay-panel-shown'});
  // panelShown = true;
  // panelLoaded && executePendingAction();
}

function onPanelHidden() {
  chrome.runtime.sendMessage({message: 'relay-panel-hidden'});
  // panelShown = false;
}
