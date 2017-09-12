/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: {
    app: [path.join(__dirname, './app.js')],
    main: [path.join(__dirname, './main.js')],
    index: [path.join(__dirname, './index.js')],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../../../lib/standalone'),
    libraryTarget: 'commonjs2',
  },
  module: {
    // noParse: ['ws'],
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
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  externals: ['cross-spawn', 'electron', 'update-notifier', 'ws'],
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'app.html') },
      { from: path.join(__dirname, 'launchApp.js') },
      { from: path.join(__dirname, 'imgs'), to: './imgs' },
      { from: path.join(__dirname, 'package.json') },
    ]),
  ],
};
