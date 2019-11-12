/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import EventEmitter from 'events';
import type { BackendBridge } from 'src/bridge';

import type { EnvironmentID, EnvironmentWrapper } from './types';

export default class Agent extends EventEmitter<{|
  shutdown: [],
|}> {
  _bridge: BackendBridge;
  _recordChangeDescriptions: boolean = false;
  _environmentWrappers: {
    [key: EnvironmentID]: EnvironmentWrapper,
  } = {};

  constructor(bridge: BackendBridge) {
    super();

    this._bridge = bridge;

    bridge.addListener('shutdown', this.shutdown);
  }

  get environmentWrappers(): {
    [key: EnvironmentID]: EnvironmentWrapper,
  } {
    return this._environmentWrappers;
  }

  shutdown = () => {
    // Clean up the overlay if visible, and associated events.
    this.emit('shutdown');
  };

  onEnvironmentEvent = (data: mixed) => {
    this._bridge.send('events', [data]);
  };
}
