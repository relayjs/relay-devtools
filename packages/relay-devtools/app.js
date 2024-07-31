// @flow
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { app, BrowserWindow } = require('electron'); // Module to create native browser window.
const { join } = require('path');

const argv = require('minimist')(process.argv.slice(2));
const projectRoots = argv._;
const defaultThemeName = argv.theme;

let mainWindow: null | typeof BrowserWindow = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: join(__dirname, 'icons/icon128.png'),
    frame: false,
    //titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const mw = mainWindow;

  // and load the index.html of the app.
  mw.loadURL('file://' + __dirname + '/app.html'); // eslint-disable-line no-path-concat
  mw.webContents.executeJavaScript(
    // We use this so that RN can keep relative JSX __source filenames
    // but "click to open in editor" still works. js1 passes project roots
    // as the argument to DevTools.
    'window.devtools.setProjectRoots(' + JSON.stringify(projectRoots) + ')'
  );

  if (argv.theme) {
    mw.webContents.executeJavaScript(
      'window.devtools.setDefaultThemeName(' +
        JSON.stringify(defaultThemeName) +
        ')'
    );
  }

  // Emitted when the window is closed.
  mw.on('closed', function() {
    mainWindow = null;
  });
});
