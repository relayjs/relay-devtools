/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { resolve } = require('path');
const { DefinePlugin } = require('webpack');
const {
  getGitHubIssuesURL,
  getGitHubURL,
  getInternalDevToolsFeedbackGroup,
  getVersionString,
} = require('../../utils');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  console.error('NODE_ENV not set');
  process.exit(1);
}
const LOGGING_URL = process.env.LOGGING_URL;

const __DEV__ = NODE_ENV === 'development';
const __ENABLE_LOGGER__ = LOGGING_URL != null;

const GITHUB_URL = getGitHubURL();
const DEVTOOLS_VERSION = getVersionString();
const GITHUB_ISSUES_URL = getGitHubIssuesURL();
const DEVTOOLS_FEEDBACK_GROUP = getInternalDevToolsFeedbackGroup();

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : false,
  entry: {
    background: './src/background.js',
    contentScript: './src/contentScript.js',
    injectGlobalHook: './src/injectGlobalHook.js',
    main: './src/main.js',
    panel: './src/panel.js',
    renderer: './src/renderer.js',
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      src: resolve(__dirname, '../../../src'),
    },
  },
  plugins: [
    new DefinePlugin({
      __DEV__: false,
      __ENABLE_LOGGER__,
      'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
      'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
      'process.env.GITHUB_ISSUES_URL': `"${GITHUB_ISSUES_URL}"`,
      'process.env.DEVTOOLS_FEEDBACK_GROUP': `"${DEVTOOLS_FEEDBACK_GROUP}"`,
      'process.env.NODE_ENV': `"${NODE_ENV}"`,
      'process.env.LOGGING_URL': `"${LOGGING_URL}"`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          configFile: resolve(__dirname, '../../../babel.config.js'),
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]',
            },
          },
        ],
      },
    ],
  },
};
