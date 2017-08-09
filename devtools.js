import { inspectedEval } from './util/util.js';

/* global chrome:false */

function attach() {
  inspectedEval('!!(window.__RELAY_DEBUGGER__)').then(isRelayPage => {
    if (!isRelayPage) {
      setTimeout(attach, 250);
      return;
    }

    chrome.devtools.panels.create('Relay', 'imgs/logo.png', 'dist/index.html');
  });
}

attach();
