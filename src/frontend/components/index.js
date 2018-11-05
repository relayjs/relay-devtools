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

declare var chrome: any;

import type {ShellType} from '../../integrations/chrome/scripts/devtools';

// import '@babel/polyfill';
import '../css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import API from '../api/BridgeAPI';
import configureStore from '../redux/store/configureStore';
import App from '../components/App';
import RelayDetector from '../components/RelayDetector.js';

let disconnect;

const isChrome = typeof chrome !== 'undefined' && Boolean(chrome.devtools);

export default function createDevtools(shell: ShellType) {
  initApp(shell);
  shell.onReload(() => {
    ReactDOM.unmountComponentAtNode(document.getElementById('devtools-root'));
    if (typeof disconnect === 'function') {
      disconnect();
    }

    initApp(shell);
  });
}

function initApp(shell: ShellType) {
  shell.connect((bridge, _disconnect) => {
    window.bridge = bridge;
    disconnect = _disconnect;
    bridge.once('ready', () => {
      if (isChrome) {
        chrome && chrome.runtime.sendMessage({message: 'relay-panel-load'});
      }
    });

    const api = new API(bridge);
    const store = configureStore(api);

    ReactDOM.render(
      <RelayDetector API={api}>
        <App store={store} />
      </RelayDetector>,
      // $FlowFixMe
      document.getElementById('devtools-root'),
    );
  });
}
