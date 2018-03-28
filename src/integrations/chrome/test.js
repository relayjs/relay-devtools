#!/usr/bin/env node

const chromeLaunch = require('chrome-launch');
const path = require('path');

const TEST_URL = 'http://localhost:3000/';
const EXTENSION_PATH = path.resolve(__dirname, '../../../lib/chrome');

// eslint-disable-next-line no-console
console.log(
  `Opening browser to ${TEST_URL}, assuming you're running relay-examples/todo`,
);

chromeLaunch(TEST_URL, {args: [`--load-extension=${EXTENSION_PATH}`]});
