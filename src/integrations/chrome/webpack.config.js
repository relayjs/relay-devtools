/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const webpack = require('webpack');
const NotifierPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');

const ICON = path.join(__dirname, './imgs/logo.png');

const __DEV__ = process.env.NODE_ENV !== 'production';

module.exports = {
  devtool: __DEV__ ? '#cheap-module-eval-source-map' : false,
  entry: {
    hook: [path.join(__dirname, './scripts/hook.js')],
    devtools: [path.join(__dirname, './scripts/devtools.js')],
    background: [path.join(__dirname, './scripts/background.js')],
    'devtools-background': [
      path.join(__dirname, './scripts/devtools-background.js'),
    ],
    backend: [path.join(__dirname, './scripts/backend.js')],
    proxy: [path.join(__dirname, './scripts/proxy.js')],
    detector: [path.join(__dirname, './scripts/detector.js')],
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
  devServer: {
    port: process.env.PORT
  },
  plugins: [
    new NotifierPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: "Webpack error",
          message: severity + ': ' + error.name,
          subtitle: error.file || '',
          icon: ICON
        });
      }
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'manifest.json'),
        to: path.join(__dirname, '../../../lib/chrome'),
      },
      {from: path.join(__dirname, 'imgs'), to: './imgs'},
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'devtools-background.html'),
      filename: 'devtools-background.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'devtools.html'),
      filename: 'devtools.html',
      inject: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ]
};
