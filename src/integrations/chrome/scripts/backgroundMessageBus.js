/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

declare var chrome: any;

/**
 * This Background script is responsible for listening to connections on the
 * Chrome plugin runtime's messaging API, installing the messageContentScript
 * and connecting together the chrome plugin scripts:
 *
 * relayDevtoolsBackend <----> Devtools
 * relayDevtoolsBackend <----> Panel
 */

const ports = {};

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'relayDevtoolsCommand') {
    connectDevtoolsCommand(port);
  } else if (port.name === 'relayDevtoolsBackend') {
    const tabId = port.sender.tab.id;
    ports[tabId] = port;
  } else if (port.name) {
    const [name, tabIdStr] = port.name.split(':');
    const tabId = Number(tabIdStr);
    if (name === 'relayDevtoolsFrontend' && tabId) {
      doublePipe(ports[tabId], port);
    }
  }
});

/**
 * Given two Chrome runtime messaging instances, pipe messages from one into
 * the other, bidirectionally.
 */
function doublePipe(one, two) {
  function handleOne(message) {
    two.postMessage(message);
  }
  function handleTwo(message) {
    one.postMessage(message);
  }
  one.onMessage.addListener(handleOne);
  two.onMessage.addListener(handleTwo);
  function shutdown() {
    one.onMessage.removeListener(handleOne);
    two.onMessage.removeListener(handleTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
  one.postMessage({ type: 'event', name: 'connect' });
  two.postMessage({ type: 'event', name: 'connect' });
}

/**
 * A connection with the Devtools script, used to perform actions in the chrome
 * plugin API that are restricted from the devtools context.
 */
function connectDevtoolsCommand(port) {
  port.onMessage.addListener(handleDevtoolsCommand);
  port.onDisconnect.addListener(() =>
    port.onMessage.removeListener(handleDevtoolsCommand),
  );
  function handleDevtoolsCommand({ command, args }) {
    if (command === 'executeScript') {
      const { tabId, file } = args;
      chrome.tabs.executeScript(tabId, { file });
    }
  }
}
