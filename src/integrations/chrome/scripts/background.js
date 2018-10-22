/**
 * Copyright (c) 2013-present, Facebook, Inc.
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
    installProxy(+port.name);
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
  return +str + '' === str;
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
    if (message.event === 'log') {
      /* eslint-disable no-console */
      return console.log('tab ' + id, message.payload);
    }
    /* eslint-disable no-console */
    console.log('devtools -> backend', message);
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    if (message.event === 'log') {
      /* eslint-disable no-console */
      return console.log('tab ' + id, message.payload);
    }
    /* eslint-disable no-console */
    console.log('backend -> devtools', message);
    one.postMessage(message);
  }

  function shutdown() {
    /* eslint-disable no-console */
    console.log('tab ' + id + ' disconnected.');
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
    ports[id] = null;
    // updateContextMenuItem()
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
  /* eslint-disable no-console */
  console.log('tab ' + id + ' connected.');
}
