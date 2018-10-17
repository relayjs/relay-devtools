/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {ShellType} from '../../integrations/chrome/scripts/devtools';
// declare var chrome: any;



export const isChrome = typeof chrome !== 'undefined' && !!chrome.devtools;
let panelShown = !isChrome;
let pendingAction = null;
let container;

if (isChrome) {
  chrome.runtime.onMessage.addListener(request => {
    if (request === 'relay-panel-shown') {
      onPanelShown();
    } else if (request === 'relay-panel-hidden') {
      onPanelHidden();
    }
  });
}

let app = null;

export default function createDevtools(shell: ShellType) {
  initApp(shell);
  shell.onReload(() => {
    console.log('onReload');
    if (app) {
      // const elem = document.getElementById(app);
      // if (elem && elem.parentNode) {
      // elem.parentNode.removeChild(elem);
      // }
    }
    // window.bridge.removeAllListeners();
    initApp(shell);
  });
}

function initApp(shell: ShellType) {
  shell.connect(bridge => {
    window.bridge = bridge;

    bridge.once('ready', () => {
      if (isChrome) {
        chrome.runtime.sendMessage({message: 'relay-panel-load'});
      }
    });



    // if (element) {



      if (!container) {
        container = document.getElementById('devtools-root');
        app = 'devtools-root';
        const api = new API(bridge);
        const store = setupRedux(api);

        ReactDOM.render(
          <RelayDetector API={api}>
            <App store={store} />
          </RelayDetector>,
          container,
        );
      }

    // }
  });
}

function ensurePaneShown (cb) {
  if (panelShown) {
    cb()
  } else {
    pendingAction = cb
  }
}

function onPanelShown () {
  panelShown = true
  if (pendingAction) {
    pendingAction()
    pendingAction = null
  }
}

function onPanelHidden () {
  panelShown = false
}
>>>>>>> new-content-scripts
