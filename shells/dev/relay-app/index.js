/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// This test harness mounts each test app as a separate root to test multi-root applications.

import { createElement } from 'react';
import {
  // $FlowFixMe Flow does not yet know about createRoot()
  unstable_createRoot as createRoot,
} from 'react-dom';
import FriendsList from './FriendsList';

import './styles.css';

const roots = [];

function mountHelper(App: (_: mixed) => React$MixedElement) {
  const container = document.createElement('div');

  ((document.body: any): HTMLBodyElement).appendChild(container);

  const root = createRoot(container);
  root.render((createElement: $FlowFixMe)(App));

  roots.push(root);
}

function mountTestApp() {
  mountHelper((FriendsList: $FlowFixMe));
}

function unmountTestApp() {
  roots.forEach(root => root.unmount());
}

mountTestApp();

window.parent.mountTestApp = mountTestApp;
window.parent.unmountTestApp = unmountTestApp;
