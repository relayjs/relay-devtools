import {inspectedEval} from './util/util.js';

/* global chrome:false */

inspectedEval('!!(window.__RELAY_DEBUGGER__)').then(() => {
  chrome.devtools.panels.create(
    'Relay',
    'imgs/logo.png',
    'dist/index.html',
    function () {},
  );
});
