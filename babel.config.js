/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const chromeManifest = require('./shells/browser/chrome/manifest.json');
const firefoxManifest = require('./shells/browser/firefox/manifest.json');

const minChromeVersion = parseInt(chromeManifest.minimum_chrome_version, 10);
const minFirefoxVersion = parseInt(
  firefoxManifest.applications.gecko.strict_min_version,
  10
);
validateVersion(minChromeVersion);
validateVersion(minFirefoxVersion);

function validateVersion(version) {
  if (version > 0 && version < 200) {
    return;
  }
  throw new Error('Suspicious browser version in manifest: ' + version);
}

module.exports = api => {
  const isTest = api.env('test');
  const targets = {};
  if (isTest) {
    targets.node = 'current';
  } else {
    targets.chrome = minChromeVersion.toString();
    targets.firefox = minFirefoxVersion.toString();

    // This targets RN/Hermes.
    targets.ie = '11';
  }
  const plugins = [
    ['relay'],
    ['@babel/plugin-proposal-nullish-coalescing-operator'],
    ['@babel/plugin-proposal-optional-chaining'],
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
  ];
  if (process.env.NODE_ENV !== 'production') {
    plugins.push(['@babel/plugin-transform-react-jsx-source']);
  }
  return {
    plugins,
    sourceType: "unambiguous",
    ignore: [
        /\/node_modules\//,
    ],
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'entry',
        targets,
    }],
      '@babel/preset-react',
      '@babel/preset-flow',
    ],
  };
};
