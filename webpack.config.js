/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.join(__dirname, '/index.html'),
  filename: 'index.html',
  inject: 'body',
  chunks: ['index'],
});

module.exports = {
  entry: {
    devtools: ['./devtools.js'],
    index: ['./index.js'],
  },
  output: {
    filename: '[name]_bundle.js',
    path: path.join(__dirname, '/extension/dist'),
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
        include: __dirname,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000',
      },
    ],
  },
  plugins: [HTMLWebpackPluginConfig],
};
