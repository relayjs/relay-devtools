/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * This Background script is responsible for listening to connections on the
 * Chrome plugin runtime's messaging API, installing the messageContentScript
 * and connecting together the chrome plugin scripts:
 *
 * relayDevtoolsBackend <----> Devtools
 * relayDevtoolsBackend <----> Panel
 */

'use strict';

declare var chrome: any;
const ports = {};

chrome.runtime.onConnect.addListener(port => {
  let tab;
  let name;

  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installProxy(Number(port.name));
  } else {
    tab = port.sender.tab.id;
    name = 'backend';
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      backend: null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab].backend) {
    doublePipe(tab, ports[tab].devtools, ports[tab].backend);
  }
});

function isNumeric(str) {
  return String(Number(str)) === str;
}

/**
 * A proxy connection with the Devtools script and backend, used to
 * perform actions in the chrome plugin API that are restricted
 * from the devtools context.
 */
function installProxy(tabId) {
  chrome.tabs.executeScript(
    tabId,
    {
      file: '/proxy.js',
    },
    function(res) {
      if (!res) {
        ports[tabId].devtools.postMessage('proxy-fail');
      } else {
        /* eslint-disable no-console */
        console.log('injected proxy to tab ' + tabId);
      }
    },
  );
}

/**
 * Given two Chrome runtime messaging instances, pipe messages from one into
 * the other, bidirectionally.
 */
function doublePipe(id, one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    // if (message.event === 'log') {}
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    // if (message.event === 'log') {}
    one.postMessage(message);
  }

  function shutdown() {
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
    ports[id] = null;
    // updateContextMenuItem()
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}

chrome.runtime.onMessage.addListener((req, sender) => {
  // This is sent from the hook content script.
  // It tells us a renderer has attached.

  if (req.hasDetectedRelay && sender.tab) {
    // We use browserAction instead of pageAction because this lets us
    // display a custom default popup when React is *not* detected.
    // It is specified in the manifest.
    // let reactBuildType = req.reactBuildType;
    // if (sender.url.indexOf('facebook.github.io/react') !== -1) {
    // Cheat: We use the development version on the website because
    // it is better for interactive examples. However we're going
    // to get misguided bug reports if the extension highlights it
    // as using the dev version. We're just going to special case
    // our own documentation and cheat. It is acceptable to use dev
    // version of React in React docs, but not in any other case.
    // reactBuildType = 'production';
    // }
    setIconAndPopup('relayBuildType', sender.tab.id);
  }
});

function setIconAndPopup(reactBuildType, tabId) {
  chrome.browserAction.setIcon({
    tabId,
    path: 'imgs/logo-icon.png',
  });
  chrome.browserAction.setPopup({
    tabId,
    popup: 'popups/development.html',
  });
}
