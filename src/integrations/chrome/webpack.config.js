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
const NodeNotifier = require('node-notifier');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const ICON = path.join(__dirname, './imgs/logo.png');
const __DEV__ = process.env.NODE_ENV !== 'production';
const devPlugins = __DEV__
  ? [
      new ChromeExtensionReloader(),
      new DuplicatePackageCheckerPlugin(),
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
            icon: ICON,
          });
        },
      }),
    ]
  : [];

module.exports = {
  devtool: __DEV__ ? 'false' : false,

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
        include: path.join(__dirname, '../../'),
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
    ...devPlugins,
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'manifest.json'),
        to: path.join(__dirname, '../../../lib/chrome'),
      },
      {from: path.join(__dirname, 'imgs'), to: './imgs'},
      {
        from: path.join(__dirname, 'popups/disabled.html'),
        to: path.join(__dirname, '../../../lib/chrome'),
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
    new MinifyPlugin({
      mangle: {topLevel: true},
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};
