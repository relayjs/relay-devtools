/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
const path = require('path');

module.exports = {
  entry: [
    path.join(__dirname, '../../util/loadRegeneratorRuntime.js'),
    path.join(__dirname, './app.js'),
  ],
  output: {
    filename: 'app.js',
    path: path.join(__dirname, '../../../lib/electron'),
    library: 'relay-devtools',
    libraryTarget: 'commonjs2',
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
        options: {
          presets: ['react', 'es2017', 'es2016', 'es2015', 'stage-2'],
          plugins: [
            'transform-regenerator',
            'transform-class-properties',
            'transform-object-rest-spread',
          ],
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  externals: {
    http: 'commonjs http', // The polyfill version differ from node's http
    buffer: 'root global', // Polyfilled version fails the instanceof check
  },
  devtool: 'eval',
};
