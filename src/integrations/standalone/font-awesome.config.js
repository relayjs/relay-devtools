/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  // Default for the style loading
  styleLoader: `style-loader?hmr=${isDev}!css-loader!less-loader`,

  styles: {
    mixins: true,
    'bordered-pulled': true,
    core: true,
    'fixed-width': true,
    icons: true,
    larger: true,
    list: true,
    path: true,
    'rotated-flipped': true,
    animated: true,
    stacked: true,
  },
};
