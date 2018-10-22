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

import 'babel-polyfill';
import '../css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import API from '../api/BridgeAPI';
import setupRedux from '../redux/setupRedux';
import App from '../components/App';
import RelayDetector from '../components/RelayDetector.js';

const isChrome = typeof chrome !== 'undefined' && Boolean(chrome.devtools);
let app;

export default function createDevtools(shell: ShellType) {
  initApp(shell);
  shell.onReload(() => {
    if (app) {
      // unsure about this logic
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

    const CONTAINER = document.getElementById('devtools-root');
    app = 'devtools-root';
    const api = new API(bridge);
    const store = setupRedux(api);

    ReactDOM.render(
      <RelayDetector API={api}>
        <App store={store} />
      </RelayDetector>,
      // $FlowFixMe
      CONTAINER,
    );
  });
}
