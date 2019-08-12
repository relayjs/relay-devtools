// @flow

import EventEmitter from 'events';
import { inspect } from 'util';
import Bridge from 'src/bridge';
import {
  TREE_OPERATION_ADD,
  TREE_OPERATION_REMOVE,
  TREE_OPERATION_REORDER_CHILDREN,
  TREE_OPERATION_UPDATE_TREE_BASE_DURATION,
} from '../constants';
import {
  getSavedComponentFilters,
  saveComponentFilters,
  shallowDiffers,
  utfDecodeString,
} from '../utils';
import { localStorageGetItem, localStorageSetItem } from '../storage';
import { __DEBUG__ } from '../constants';
import { printStore } from 'src/__tests__/storeSerializer';

import type { ComponentFilter } from '../types';

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

  _componentFilters: Array<ComponentFilter>;

  // At least one of the injected renderers contains (DEV only) owner metadata.
  _hasOwnerMetadata: boolean = false;

  // Map of ID to (mutable) Element.
  // Elements are mutated to avoid excessive cloning during tree updates.
  // The InspectedElementContext also relies on this mutability for its WeakMap usage.
  _idToElement: Map<number, Element> = new Map();

  // Can the backend use the Storage API (e.g. localStorage)?
  // If not, features like reload-and-profile will not work correctly and must be disabled.
  _isBackendStorageAPISupported: boolean = false;

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

    // Default this setting to true unless otherwise specified.
    this._collapseNodesByDefault =
      localStorageGetItem(LOCAL_STORAGE_COLLAPSE_ROOTS_BY_DEFAULT_KEY) !==
      'false';

    this._recordChangeDescriptions =
      localStorageGetItem(LOCAL_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY) ===
      'true';

    this._componentFilters = getSavedComponentFilters();

    if (config != null) {
      const { supportsNativeInspection } = config;
      this._supportsNativeInspection = supportsNativeInspection !== false;
    }

    this._bridge = bridge;
    bridge.addListener('operations', this.onBridgeOperations);
    bridge.addListener(
      'overrideComponentFilters',
      this.onBridgeOverrideComponentFilters
    );
    bridge.addListener('shutdown', this.onBridgeShutdown);
    bridge.addListener(
      'isBackendStorageAPISupported',
      this.onBridgeStorageSupported
    );
  }

  // This is only used in tests to avoid memory leaks.
  assertExpectedRootMapSizes() {
    if (this.roots.length === 0) {
      // The only safe time to assert these maps are empty is when the store is empty.
      this.assertMapSizeMatchesRootCount(this._idToElement, '_idToElement');
      this.assertMapSizeMatchesRootCount(this._ownersMap, '_ownersMap');
    }

    // These maps should always be the same size as the number of roots
    this.assertMapSizeMatchesRootCount(
      this._rootIDToCapabilities,
      '_rootIDToCapabilities'
    );
    this.assertMapSizeMatchesRootCount(
      this._rootIDToRendererID,
      '_rootIDToRendererID'
    );
  }

  // This is only used in tests to avoid memory leaks.
  assertMapSizeMatchesRootCount(map: Map<any, any>, mapName: string) {
    const expectedSize = this.roots.length;
    if (map.size !== expectedSize) {
      throw new Error(
        `Expected ${mapName} to contain ${expectedSize} items, but it contains ${
          map.size
        } items\n\n${inspect(map, {
          depth: 20,
        })}`
      );
    }
  }

  get collapseNodesByDefault(): boolean {
    return this._collapseNodesByDefault;
  }
  set collapseNodesByDefault(value: boolean): void {
    this._collapseNodesByDefault = value;

    localStorageSetItem(
      LOCAL_STORAGE_COLLAPSE_ROOTS_BY_DEFAULT_KEY,
      value ? 'true' : 'false'
    );

    this.emit('collapseNodesByDefault');
  }

  get componentFilters(): Array<ComponentFilter> {
    return this._componentFilters;
  }
  set componentFilters(value: Array<ComponentFilter>): void {
    // Filter updates are expensive to apply (since they impact the entire tree).
    // Let's determine if they've changed and avoid doing this work if they haven't.
    const prevEnabledComponentFilters = this._componentFilters.filter(
      filter => filter.isEnabled
    );
    const nextEnabledComponentFilters = value.filter(
      filter => filter.isEnabled
    );
    let haveEnabledFiltersChanged =
      prevEnabledComponentFilters.length !== nextEnabledComponentFilters.length;
    if (!haveEnabledFiltersChanged) {
      for (let i = 0; i < nextEnabledComponentFilters.length; i++) {
        const prevFilter = prevEnabledComponentFilters[i];
        const nextFilter = nextEnabledComponentFilters[i];
        if (shallowDiffers(prevFilter, nextFilter)) {
          haveEnabledFiltersChanged = true;
          break;
        }
      }
    }

    this._componentFilters = value;

    // Update persisted filter preferences stored in localStorage.
    saveComponentFilters(value);

    // Notify the renderer that filter prefernces have changed.
    // This is an expensive opreation; it unmounts and remounts the entire tree,
    // so only do it if the set of enabled component filters has changed.
    if (haveEnabledFiltersChanged) {
      this._bridge.send('updateComponentFilters', value);
    }

    this.emit('componentFilters');
  }

  get hasOwnerMetadata(): boolean {
    return this._hasOwnerMetadata;
  }

  get numElements(): number {
    return this._weightAcrossRoots;
  }

  get recordChangeDescriptions(): boolean {
    return this._recordChangeDescriptions;
  }
  set recordChangeDescriptions(value: boolean): void {
    this._recordChangeDescriptions = value;

    localStorageSetItem(
      LOCAL_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY,
      value ? 'true' : 'false'
    );

    this.emit('recordChangeDescriptions');
  }

  get revision(): number {
    return this._revision;
  }

  get rootIDToRendererID(): Map<number, number> {
    return this._rootIDToRendererID;
  }

  get roots(): $ReadOnlyArray<number> {
    return this._roots;
  }

  get supportsNativeInspection(): boolean {
    return this._supportsNativeInspection;
  }

  containsElement(id: number): boolean {
    return this._idToElement.get(id) != null;
  }

  onBridgeOperations = (operations: Array<number>) => {
    if (__DEBUG__) {
      console.groupCollapsed('onBridgeOperations');
      debug('onBridgeOperations', operations.join(','));
    }

    let haveRootsChanged = false;

    const addedElementIDs: Array<number> = [];
    // This is a mapping of removed ID -> parent ID:
    const removedElementIDs: Map<number, number> = new Map();
    // We'll use the parent ID to adjust selection if it gets deleted.

    let i = 2;

    // Reassemble the string table.
    const stringTable = [
      null, // ID = 0 corresponds to the null string.
    ];
    const stringTableSize = operations[i++];
    const stringTableEnd = i + stringTableSize;
    while (i < stringTableEnd) {
      const nextLength = operations[i++];
      const nextString = utfDecodeString(
        (operations.slice(i, i + nextLength): any)
      );
      stringTable.push(nextString);
      i += nextLength;
    }

    while (i < operations.length) {
      const operation = operations[i];
      switch (operation) {
        case TREE_OPERATION_ADD:
          break;
        case TREE_OPERATION_REMOVE:
          break;
        case TREE_OPERATION_REORDER_CHILDREN:
          break;
        case TREE_OPERATION_UPDATE_TREE_BASE_DURATION:
          // Base duration updates are only sent while profiling is in progress.
          // We can ignore them at this point.
          // The profiler UI uses them lazily in order to generate the tree.
          i = i + 3;
          break;
        default:
          throw Error(`Unsupported Bridge operation ${operation}`);
      }
      i += 10;
    }

    this._revision++;

    if (haveRootsChanged) {
      this._hasOwnerMetadata = false;
      this._rootIDToCapabilities.forEach(({ hasOwnerMetadata }) => {
        if (hasOwnerMetadata) {
          this._hasOwnerMetadata = true;
        }
      });

      this.emit('roots');
    }

    if (__DEBUG__) {
      console.log(printStore(this, true));
      console.groupEnd();
    }

    this.emit('mutated', [addedElementIDs, removedElementIDs]);
  };

  // Certain backends save filters on a per-domain basis.
  // In order to prevent filter preferences and applied filters from being out of sync,
  // this message enables the backend to override the frontend's current ("saved") filters.
  // This action should also override the saved filters too,
  // else reloading the frontend without reloading the backend would leave things out of sync.
  onBridgeOverrideComponentFilters = (
    componentFilters: Array<ComponentFilter>
  ) => {
    this._componentFilters = componentFilters;

    saveComponentFilters(componentFilters);
  };

  onBridgeShutdown = () => {
    if (__DEBUG__) {
      debug('onBridgeShutdown', 'unsubscribing from Bridge');
    }

    this._bridge.removeListener('operations', this.onBridgeOperations);
    this._bridge.removeListener('shutdown', this.onBridgeShutdown);
    this._bridge.removeListener(
      'isBackendStorageAPISupported',
      this.onBridgeStorageSupported
    );
  };

  onBridgeStorageSupported = (isBackendStorageAPISupported: boolean) => {
    this._isBackendStorageAPISupported = isBackendStorageAPISupported;
  };
}
