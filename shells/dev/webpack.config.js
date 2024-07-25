/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Webpack = require('webpack');
const {
  getGitHubIssuesURL,
  getGitHubURL,
  getInternalDevToolsFeedbackGroup,
  getVersionString,
} = require('../utils');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  console.error('NODE_ENV not set');
  process.exit(1);
}

const TARGET = process.env.TARGET;
if (!TARGET) {
  console.error('TARGET not set');
  process.exit(1);
}

const __DEV__ = NODE_ENV === 'development';

const GITHUB_URL = getGitHubURL();
const DEVTOOLS_VERSION = getVersionString();
const GITHUB_ISSUES_URL = getGitHubIssuesURL();
const DEVTOOLS_FEEDBACK_GROUP = getInternalDevToolsFeedbackGroup();

const config = {
  mode: __DEV__ ? 'development' : 'production',
  devtool: false,
  entry: {
    app: './relay-app/index.js',
    backend: './src/backend.js',
    devtools: './src/devtools.js',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../../src'),
    },
  },
  plugins: [
    new Webpack.DefinePlugin({
      __DEV__: __DEV__,
      'process.env.GITHUB_URL': `"${GITHUB_URL}"`,
      'process.env.DEVTOOLS_VERSION': `"${DEVTOOLS_VERSION}"`,
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
          configFile: require.resolve('../../babel.config.js'),
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

config.output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].js',
  publicPath: '/dist/',
};
if (TARGET === 'local') {
  config.devServer = {
    static: {
      directory:path.join(__dirname, '/'),
    },
    hot: true,
    port: 8080,
  };
}

module.exports = config;
