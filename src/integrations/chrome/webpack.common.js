/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    hook: [path.join(__dirname, './scripts/hook.js')],
    devtools: [path.join(__dirname, './scripts/devtools.js')],
    background: [path.join(__dirname, './scripts/background.js')],
    'devtools-background': [
      path.join(__dirname, './scripts/devtools-background.js'),
    ],
    backend: [path.join(__dirname, './scripts/backend.js')],
    proxy: [path.join(__dirname, './scripts/proxy.js')],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../../../lib/chrome'),
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  module: {
    rules: [
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
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-flow',
              '@babel/preset-react',
            ],
            plugins: [
              'react-hot-loader/babel',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-object-rest-spread',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-export-default-from',
            ],
          },
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, './manifest.json'),
        to: path.join(__dirname, '../../../lib/chrome/manifest.json'),
      },
      {from: path.join(__dirname, 'imgs'), to: './imgs'},
      {
        from: path.join(__dirname, 'popups'),
        to: path.join(__dirname, '../../../lib/chrome/popups'),
      },
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
  ],
};
