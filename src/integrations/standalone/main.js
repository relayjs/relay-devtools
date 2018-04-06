/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const url = require('url');

const {app, BrowserWindow} = require('electron');

app.setName('Relay DevTools');
app.dock.setIcon(path.join(__dirname, 'imgs/logo.png'));

let mainWindow;

// Insist on a single instance of the app, since it runs a ws server.
const isDupe = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
});

if (isDupe) {
  app.quit();
}

app.once('window-all-closed', () => {
  app.quit();
});

app.once('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Relay DevTools',
    icon: path.join(__dirname, 'imgs/logo.png'),
  });

  const appUrl = url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'app.html'),
  });

  // Load the app entry point.
  mainWindow.loadURL(appUrl);

  // Emitted when the window is closed.
  mainWindow.once('closed', () => {
    mainWindow = null;
  });
});
