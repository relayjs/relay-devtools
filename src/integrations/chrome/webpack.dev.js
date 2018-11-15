/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const NotifierPlugin = require('friendly-errors-webpack-plugin');
const NodeNotifier = require('node-notifier');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const DuplicatePlugin = require('duplicate-package-checker-webpack-plugin');
const path = require('path');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.NamedModulesPlugin(),
    new DuplicatePlugin(),
    new NotifierPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        NodeNotifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || '',
          icon: path.join(__dirname, './imgs/logo.png'),
        });
      },
    }),
    new ChromeExtensionReloader(),
  ],
});
