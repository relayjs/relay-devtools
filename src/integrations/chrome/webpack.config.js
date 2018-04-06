/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    backendAgent: [path.join(__dirname, './scripts/backendAgent.js')],
    backgroundMessageBus: [
      path.join(__dirname, './scripts/backgroundMessageBus.js'),
    ],
    devtoolsMain: [path.join(__dirname, './scripts/devtoolsMain.js')],
    devtoolsPanel: [path.join(__dirname, './scripts/devtoolsPanel.js')],
    globalHook: [path.join(__dirname, './scripts/globalHook.js')],
    injectBackendAgent: [
      path.join(__dirname, './scripts/injectBackendAgent.js'),
    ],
    injectGlobalHook: [path.join(__dirname, './scripts/injectGlobalHook.js')],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../../../lib/chrome'),
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader',
      },
      {
        test: /\.js$/,
        include: path.join(__dirname, '../../'),
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: path.join(__dirname, 'manifest.json')},
      {from: path.join(__dirname, 'imgs'), to: './imgs'},
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './devtoolsPanel.html'),
      filename: 'devtoolsPanel.html',
      inject: 'body',
      chunks: ['devtoolsPanel'],
    }),
    new HtmlWebpackPlugin({
      filename: 'devtoolsMain.html',
      inject: 'body',
      chunks: ['devtoolsMain'],
    }),
  ],
};
