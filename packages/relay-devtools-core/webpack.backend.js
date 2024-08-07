/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { resolve } = require('path');
const Webpack = require('webpack');
const {
  getGitHubIssuesURL,
  getGitHubURL,
  getInternalDevToolsFeedbackGroup,
  getVersionString,
} = require('../../shells/utils');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  console.error('NODE_ENV not set');
  process.exit(1);
}

const __DEV__ = NODE_ENV === 'development';

const GITHUB_URL = getGitHubURL();
const DEVTOOLS_VERSION = getVersionString();
const GITHUB_ISSUES_URL = getGitHubIssuesURL();
const DEVTOOLS_FEEDBACK_GROUP = getInternalDevToolsFeedbackGroup();

module.exports = {
  mode: 'development', // TODO TESTING __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : false,
  entry: {
    backend: './src/backend.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',

    // This name is important; standalone references it in order to connect.
    library: {
      name: 'RelayDevToolsBackend',
      type: 'umd',
    },
  },
  resolve: {
    alias: {
      src: resolve(__dirname, '../../src'),
    },
  },
  plugins: [
    new Webpack.DefinePlugin({
      __DEV__: true,
      'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
      'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
      'process.env.GITHUB_ISSUES_URL': `"${GITHUB_ISSUES_URL}"`,
      'process.env.DEVTOOLS_FEEDBACK_GROUP': `"${DEVTOOLS_FEEDBACK_GROUP}"`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          configFile: resolve(__dirname, '../../babel.config.js'),
        },
      },
    ],
  },
};
