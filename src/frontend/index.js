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

import type {ShellType} from '../integrations/chrome/scripts/devtools';

import './css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import API from './api/BridgeAPI';
import configureStore from './redux/store/configureStore';
import App from './components/App';
// import RelayDetector from './containers/RelayDetector';

let app = null;

const isChrome = typeof chrome !== 'undefined' && Boolean(chrome.devtools);

export default function createDevtools(shell: ShellType) {
  initApp(shell);
  shell.onReload(() => {
    if (app) {
      ReactDOM.unmountComponentAtNode(document.getElementById('devtools-root'));
    }

    app = null;
    initApp(shell);
  });
}

function initApp(shell: ShellType) {
  shell.connect(bridge => {
    window.bridge = bridge;

    bridge.once('ready', () => {
      if (isChrome) {
        chrome && chrome.runtime.sendMessage({message: 'relay-panel-load'});
      }
    });

    const api = new API(bridge);
    const store = configureStore(api);
    app = 'devtools-root';
    ReactDOM.render(
      // <RelayDetector API={api}>
      <App store={store} api={api} />,
      // </RelayDetector>
      // $FlowFixMe
      document.getElementById('devtools-root'),
    );
  });
}
