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

declare var chrome: any;

export type ShellType = {
  connect: (callback: (bridge: any) => void) => void,
  onReload: (callback: () => void) => void,
};

import createDevtools from '../../../frontend/components';
import Bridge from '../../../transport/Bridge';

createDevtools({
  connect(cb) {
    injectScript(chrome.runtime.getURL('/backend.js'), () => {
      const port = chrome.runtime.connect({
        /* eslint-disable no-implicit-coercion */
        name: '' + chrome.devtools.inspectedWindow.tabId,
      });
      let disconnected = false;
      port.onDisconnect.addListener(() => {
        disconnected = true;
      });

      const bridge = new Bridge({
        listen(fn) {
          port.onMessage.addListener(fn);
        },
        send(data) {
          if (!disconnected) {
            port.postMessage(data);
          }
        },
      });

      cb(bridge, () => port && port.disconnect());
    });
  },

  onReload(reloadFn) {
    chrome.devtools.network.onNavigated.addListener(reloadFn);

    // return () => {
    //   chrome.devtools.network.onNavigated.removeListener(reloadFn);
    // };
  },
});

function injectScript(scriptName, cb) {
  const src = `
     (function() {
       var script = document.constructor.prototype.createElement.call(document, 'script');
       script.src = "${scriptName}";
       document.documentElement.appendChild(script);
       script.parentNode.removeChild(script);
     })()
   `;

  chrome.devtools.inspectedWindow.eval(src, function(res, err) {
    if (err) {
      /* eslint-disable no-console */
      console.log(err);
    }
    cb();
  });
}
