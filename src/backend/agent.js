// @flow

import EventEmitter from 'events';
import throttle from 'lodash.throttle';
import Bridge from 'src/bridge';
import { SESSION_STORAGE_LAST_SELECTION_KEY, __DEBUG__ } from '../constants';
import {
  sessionStorageGetItem,
  sessionStorageRemoveItem,
  sessionStorageSetItem,
} from 'src/storage';

import type {
  InstanceAndStyle,
  NativeType,
  OwnersList,
  PathFrame,
  PathMatch,
  RendererID,
  RendererInterface,
} from './types';
import type { ComponentFilter } from '../types';

const debug = (methodName, ...args) => {
  if (__DEBUG__) {
    console.log(
      `%cAgent %c${methodName}`,
      'color: purple; font-weight: bold;',
      'font-weight: bold;',
      ...args
    );
  }
};

type ElementAndRendererID = {|
  id: number,
  rendererID: number,
|};

type InspectElementParams = {|
  id: number,
  path?: Array<string | number>,
  rendererID: number,
|};

type OverrideHookParams = {|
  id: number,
  hookID: number,
  path: Array<string | number>,
  rendererID: number,
  value: any,
|};

type SetInParams = {|
  id: number,
  path: Array<string | number>,
  rendererID: number,
  value: any,
|};

type OverrideSuspenseParams = {|
  id: number,
  rendererID: number,
  forceFallback: boolean,
|};

type PersistedSelection = {|
  rendererID: number,
  path: Array<PathFrame>,
|};

export default class Agent extends EventEmitter<{|
  hideNativeHighlight: [],
  showNativeHighlight: [NativeType],
  shutdown: [],
|}> {
  _bridge: Bridge;
  _recordChangeDescriptions: boolean = false;
  _rendererInterfaces: { [key: RendererID]: RendererInterface } = {};
  _persistedSelection: PersistedSelection | null = null;
  _persistedSelectionMatch: PathMatch | null = null;

  constructor(bridge: Bridge) {
    super();

    const persistedSelectionString = sessionStorageGetItem(
      SESSION_STORAGE_LAST_SELECTION_KEY
    );
    if (persistedSelectionString != null) {
      this._persistedSelection = JSON.parse(persistedSelectionString);
    }

    this._bridge = bridge;

    bridge.addListener('captureScreenshot', this.captureScreenshot);
    bridge.addListener('getOwnersList', this.getOwnersList);
    bridge.addListener('inspectElement', this.inspectElement);
    bridge.addListener('logElementToConsole', this.logElementToConsole);
    bridge.addListener('overrideContext', this.overrideContext);
    bridge.addListener('overrideHookState', this.overrideHookState);
    bridge.addListener('overrideProps', this.overrideProps);
    bridge.addListener('overrideState', this.overrideState);
    bridge.addListener('overrideSuspense', this.overrideSuspense);
    bridge.addListener('screenshotCaptured', this.screenshotCaptured);
    bridge.addListener('selectElement', this.selectElement);
    bridge.addListener(
      'syncSelectionFromNativeElementsPanel',
      this.syncSelectionFromNativeElementsPanel
    );
    bridge.addListener('shutdown', this.shutdown);
    bridge.addListener('updateComponentFilters', this.updateComponentFilters);
    bridge.addListener('viewElementSource', this.viewElementSource);

    // Notify the frontend if the backend supports the Storage API (e.g. localStorage).
    // If not, features like reload-and-profile will not work correctly and must be disabled.
    let isBackendStorageAPISupported = false;
    try {
      localStorage.getItem('test');
      isBackendStorageAPISupported = true;
    } catch (error) {}
    bridge.send('isBackendStorageAPISupported', isBackendStorageAPISupported);
  }

  get rendererInterfaces(): { [key: RendererID]: RendererInterface } {
    return this._rendererInterfaces;
  }

  captureScreenshot = ({
    commitIndex,
    rootID,
  }: {
    commitIndex: number,
    rootID: number,
  }) => {
    this._bridge.send('captureScreenshot', { commitIndex, rootID });
  };

  getInstanceAndStyle({
    id,
    rendererID,
  }: ElementAndRendererID): InstanceAndStyle | null {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}"`);
      return null;
    }
    return renderer.getInstanceAndStyle(id);
  }

  getIDForNode(node: Object): number | null {
    for (let rendererID in this._rendererInterfaces) {
      // A renderer will throw if it can't find a fiber for the specified node.
      try {
        const renderer = ((this._rendererInterfaces[
          (rendererID: any)
        ]: any): RendererInterface);
        return renderer.getFiberIDForNative(node, true);
      } catch (e) {}
    }
    return null;
  }

  getOwnersList = ({ id, rendererID }: ElementAndRendererID) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      const owners = renderer.getOwnersList(id);
      this._bridge.send('ownersList', ({ id, owners }: OwnersList));
    }
  };

  inspectElement = ({ id, path, rendererID }: InspectElementParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      this._bridge.send('inspectedElement', renderer.inspectElement(id, path));
    }
  };

  logElementToConsole = ({ id, rendererID }: ElementAndRendererID) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.logElementToConsole(id);
    }
  };

  screenshotCaptured = ({
    commitIndex,
    dataURL,
    rootID,
  }: {|
    commitIndex: number,
    dataURL: string,
    rootID: number,
  |}) => {
    this._bridge.send('screenshotCaptured', { commitIndex, dataURL });
  };

  selectElement = ({ id, rendererID }: ElementAndRendererID) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.selectElement(id);

      // When user selects an element, stop trying to restore the selection,
      // and instead remember the current selection for the next reload.
      if (
        this._persistedSelectionMatch === null ||
        this._persistedSelectionMatch.id !== id
      ) {
        this._persistedSelection = null;
        this._persistedSelectionMatch = null;
        renderer.setTrackedPath(null);
        this._throttledPersistSelection(rendererID, id);
      }

      // TODO: If there was a way to change the selected DOM element
      // in native Elements tab without forcing a switch to it, we'd do it here.
      // For now, it doesn't seem like there is a way to do that:
      // https://github.com/bvaughn/react-devtools-experimental/issues/102
      // (Setting $0 doesn't work, and calling inspect() switches the tab.)
    }
  };

  overrideContext = ({ id, path, rendererID, value }: SetInParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.setInContext(id, path, value);
    }
  };

  overrideHookState = ({
    id,
    hookID,
    path,
    rendererID,
    value,
  }: OverrideHookParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.setInHook(id, hookID, path, value);
    }
  };

  overrideProps = ({ id, path, rendererID, value }: SetInParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.setInProps(id, path, value);
    }
  };

  overrideState = ({ id, path, rendererID, value }: SetInParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.setInState(id, path, value);
    }
  };

  overrideSuspense = ({
    id,
    rendererID,
    forceFallback,
  }: OverrideSuspenseParams) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.overrideSuspense(id, forceFallback);
    }
  };

  selectNode(target: Object): void {
    const id = this.getIDForNode(target);
    if (id !== null) {
      this._bridge.send('selectFiber', id);
    }
  }

  setRendererInterface(
    rendererID: RendererID,
    rendererInterface: RendererInterface
  ) {
    this._rendererInterfaces[rendererID] = rendererInterface;

    // When the renderer is attached, we need to tell it whether
    // we remember the previous selection that we'd like to restore.
    // It'll start tracking mounts for matches to the last selection path.
    const selection = this._persistedSelection;
    if (selection !== null && selection.rendererID === rendererID) {
      rendererInterface.setTrackedPath(selection.path);
    }
  }

  syncSelectionFromNativeElementsPanel = () => {
    const target = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
    if (target == null) {
      return;
    }
    this.selectNode(target);
  };

  shutdown = () => {
    // Clean up the overlay if visible, and associated events.
    this.emit('shutdown');
  };

  updateComponentFilters = (componentFilters: Array<ComponentFilter>) => {
    for (let rendererID in this._rendererInterfaces) {
      const renderer = ((this._rendererInterfaces[
        (rendererID: any)
      ]: any): RendererInterface);
      renderer.updateComponentFilters(componentFilters);
    }
  };

  viewElementSource = ({ id, rendererID }: ElementAndRendererID) => {
    const renderer = this._rendererInterfaces[rendererID];
    if (renderer == null) {
      console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
    } else {
      renderer.prepareViewElementSource(id);
    }
  };

  onHookOperations = (operations: Array<number>) => {
    if (__DEBUG__) {
      debug('onHookOperations', operations);
    }

    // TODO:
    // The chrome.runtime does not currently support transferables; it forces JSON serialization.
    // See bug https://bugs.chromium.org/p/chromium/issues/detail?id=927134
    //
    // Regarding transferables, the postMessage doc states:
    // If the ownership of an object is transferred, it becomes unusable (neutered)
    // in the context it was sent from and becomes available only to the worker it was sent to.
    //
    // Even though Chrome is eventually JSON serializing the array buffer,
    // using the transferable approach also sometimes causes it to throw:
    //   DOMException: Failed to execute 'postMessage' on 'Window': ArrayBuffer at index 0 is already neutered.
    //
    // See bug https://github.com/bvaughn/react-devtools-experimental/issues/25
    //
    // The Store has a fallback in place that parses the message as JSON if the type isn't an array.
    // For now the simplest fix seems to be to not transfer the array.
    // This will negatively impact performance on Firefox so it's unfortunate,
    // but until we're able to fix the Chrome error mentioned above, it seems necessary.
    //
    // this._bridge.send('operations', operations, [operations.buffer]);
    this._bridge.send('operations', operations);

    if (this._persistedSelection !== null) {
      const rendererID = operations[0];
      if (this._persistedSelection.rendererID === rendererID) {
        // Check if we can select a deeper match for the persisted selection.
        const renderer = this._rendererInterfaces[rendererID];
        if (renderer == null) {
          console.warn(`Invalid renderer id "${rendererID}"`);
        } else {
          const prevMatch = this._persistedSelectionMatch;
          const nextMatch = renderer.getBestMatchForTrackedPath();
          this._persistedSelectionMatch = nextMatch;
          const prevMatchID = prevMatch !== null ? prevMatch.id : null;
          const nextMatchID = nextMatch !== null ? nextMatch.id : null;
          if (prevMatchID !== nextMatchID) {
            if (nextMatchID !== null) {
              // We moved forward, unlocking a deeper node.
              this._bridge.send('selectFiber', nextMatchID);
            }
          }
          if (nextMatch !== null && nextMatch.isFullMatch) {
            // We've just unlocked the innermost selected node.
            // There's no point tracking it further.
            this._persistedSelection = null;
            this._persistedSelectionMatch = null;
            renderer.setTrackedPath(null);
          }
        }
      }
    }
  };

  _throttledPersistSelection = throttle((rendererID: number, id: number) => {
    // This is throttled, so both renderer and selected ID
    // might not be available by the time we read them.
    // This is why we need the defensive checks here.
    const renderer = this._rendererInterfaces[rendererID];
    const path = renderer != null ? renderer.getPathForElement(id) : null;
    if (path !== null) {
      sessionStorageSetItem(
        SESSION_STORAGE_LAST_SELECTION_KEY,
        JSON.stringify(({ rendererID, path }: PersistedSelection))
      );
    } else {
      sessionStorageRemoveItem(SESSION_STORAGE_LAST_SELECTION_KEY);
    }
  }, 1000);
}
