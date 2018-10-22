/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Creates a BridgeTransport for use in the frontend of a Chrome plugin, which
 * communicates via Chrome messaging API, through a Background script
 * which is connected to the Devtools backend via a ContentScript.
 */

'use strict';

// declare var chrome: any;

export type ShellType = {
  connect: (callback: (bridge: any) => void) => void,
  onReload: (callback: () => void) => void,
};

import createDevtools from '../../../frontend/components';
import Bridge from '../../../transport/Bridge';

// this script is called when the VueDevtools panel is activated.

// import { initDevTools } from 'src/devtools'
// import Bridge from 'src/bridge'

createDevtools({

  /**
   * Inject backend, connect to background, and send back the bridge.
   *
   * @param {Function} cb
   */

  connect (cb) {
    // 1. inject backend code into page
    injectScript(chrome.runtime.getURL('/backend.js'), () => {
      // 2. connect to background to setup proxy
      const port = chrome.runtime.connect({
        name: '' + chrome.devtools.inspectedWindow.tabId
      })
      let disconnected = false
      port.onDisconnect.addListener(() => {
        disconnected = true
      })

      const bridge = new Bridge({
        listen (fn) {
          port.onMessage.addListener(fn)
        },
        send (data) {
          if (!disconnected) {
            port.postMessage(data)
          }
        }
      })
      // 3. send a proxy API to the panel
      cb(bridge)
    })
  },

  /**
   * Register a function to reload the devtools app.
   *
   * @param {Function} reloadFn
   */

  onReload (reloadFn) {
    chrome.devtools.network.onNavigated.addListener(reloadFn)
  }
})

/**
 * Inject a globally evaluated script, in the same context with the actual
 * user app.
 *
 * @param {String} scriptName
 * @param {Function} cb
 */

 function injectScript (scriptName, cb) {
   const src = `
     (function() {
       var script = document.constructor.prototype.createElement.call(document, 'script');
       script.src = "${scriptName}";
       document.documentElement.appendChild(script);
       script.parentNode.removeChild(script);
     })()
   `
   chrome.devtools.inspectedWindow.eval(src, function (res, err) {
     if (err) {
       console.log(err)
     }
     cb()
   })
 }
