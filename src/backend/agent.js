// @flow

import EventEmitter from 'events';
import type { BackendBridge } from 'src/bridge';

import type { EnvironmentID, RendererInterface } from './types';

export default class Agent extends EventEmitter<{|
  shutdown: [],
|}> {
  _bridge: BackendBridge;
  _recordChangeDescriptions: boolean = false;
  _rendererInterfaces: {
    [key: EnvironmentID]: RendererInterface,
  } = {};

  constructor(bridge: BackendBridge) {
    super();

    this._bridge = bridge;

    bridge.addListener('shutdown', this.shutdown);
  }

  get rendererInterfaces(): {
    [key: EnvironmentID]: RendererInterface,
  } {
    return this._rendererInterfaces;
  }

  shutdown = () => {
    // Clean up the overlay if visible, and associated events.
    this.emit('shutdown');
  };
}
