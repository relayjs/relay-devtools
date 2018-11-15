const merge = require('webpack-merge');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new MinifyPlugin({
      mangle: {topLevel: true},
    }),
  ],
});
