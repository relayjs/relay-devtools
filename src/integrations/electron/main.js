/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

// Module to control application life.
const app = require('electron').app;
// Module to create native browser window.
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');

let mainWindow = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icons/icon128.png'),
  });

  // and load the index.html of the app.
  // eslint-disable-next-line no-path-concat
  mainWindow.loadURL('file://' + __dirname + '/app.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
