// @flow

import EventEmitter from 'events';
import Bridge from 'src/bridge';
import { __DEBUG__ } from '../constants';
import { printStore } from 'src/__tests__/storeSerializer';

const debug = (methodName, ...args) => {
  if (__DEBUG__) {
    console.log(
      `%cStore %c${methodName}`,
      'color: green; font-weight: bold;',
      'font-weight: bold;',
      ...args
    );
  }
};

/**
 * The store is the single source of truth for updates from the backend.
 * ContextProviders can subscribe to the Store for specific things they want to provide.
 */
export default class Store extends EventEmitter<{|
  collapseNodesByDefault: [],
  componentFilters: [],
  mutated: [[Array<number>, Map<number, number>]],
  recordChangeDescriptions: [],
  roots: [],
|}> {
  _bridge: Bridge;

  constructor(bridge: Bridge) {
    super();

    if (__DEBUG__) {
      debug('constructor', 'subscribing to Bridge');
    }

    this._bridge = bridge;
    bridge.addListener('operations', this.onBridgeOperations);
    bridge.addListener('shutdown', this.onBridgeShutdown);
  }

  onBridgeOperations = (operations: Array<number>) => {
    if (__DEBUG__) {
      console.groupCollapsed('onBridgeOperations');
      debug('onBridgeOperations', operations.join(','));
    }

    if (__DEBUG__) {
      console.log(printStore(this, true));
      console.groupEnd();
    }

    // this.emit('mutated', [addedElementIDs, removedElementIDs]);
  };

  onBridgeShutdown = () => {
    if (__DEBUG__) {
      debug('onBridgeShutdown', 'unsubscribing from Bridge');
    }

    this._bridge.removeListener('operations', this.onBridgeOperations);
    this._bridge.removeListener('shutdown', this.onBridgeShutdown);
  };
}
