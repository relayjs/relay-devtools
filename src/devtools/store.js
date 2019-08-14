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

const LOCAL_STORAGE_COLLAPSE_ROOTS_BY_DEFAULT_KEY =
  'React::DevTools::collapseNodesByDefault';
const LOCAL_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY =
  'React::DevTools::recordChangeDescriptions';

type Config = {|
  supportsCaptureScreenshots?: boolean,
  supportsNativeInspection?: boolean,
|};

export type Capabilities = {|
  hasOwnerMetadata: boolean,
|};

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

  // Should new nodes be collapsed by default when added to the tree?
  _collapseNodesByDefault: boolean = true;

  // At least one of the injected renderers contains (DEV only) owner metadata.
  _hasOwnerMetadata: boolean = false;

  // Map of ID to (mutable) Element.
  // Elements are mutated to avoid excessive cloning during tree updates.
  // The InspectedElementContext also relies on this mutability for its WeakMap usage.
  _idToElement: Map<number, Element> = new Map();

  // Map of element (id) to the set of elements (ids) it owns.
  // This map enables getOwnersListForElement() to avoid traversing the entire tree.
  _ownersMap: Map<number, Set<number>> = new Map();

  _recordChangeDescriptions: boolean = false;

  // Incremented each time the store is mutated.
  // This enables a passive effect to detect a mutation between render and commit phase.
  _revision: number = 0;

  // This Array must be treated as immutable!
  // Passive effects will check it for changes between render and mount.
  _roots: $ReadOnlyArray<number> = [];

  _rootIDToCapabilities: Map<number, Capabilities> = new Map();

  // Renderer ID is needed to support inspection fiber props, state, and hooks.
  _rootIDToRendererID: Map<number, number> = new Map();

  // These options may be initially set by a confiugraiton option when constructing the Store.
  // In the case of "supportsProfiling", the option may be updated based on the injected renderers.
  _supportsNativeInspection: boolean = false;

  // Total number of visible elements (within all roots).
  // Used for windowing purposes.
  _weightAcrossRoots: number = 0;

  constructor(bridge: Bridge, config?: Config) {
    super();

    if (__DEBUG__) {
      debug('constructor', 'subscribing to Bridge');
    }

    if (config != null) {
      const { supportsNativeInspection } = config;
      this._supportsNativeInspection = supportsNativeInspection !== false;
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
