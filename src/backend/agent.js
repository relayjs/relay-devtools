// @flow

import EventEmitter from 'events';
import Bridge from 'src/bridge';

import type {
  NativeType,
  PathFrame,
  PathMatch,
  RendererID,
  RendererInterface,
} from './types';

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

    this._bridge = bridge;

    bridge.addListener('shutdown', this.shutdown);

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

  shutdown = () => {
    // Clean up the overlay if visible, and associated events.
    this.emit('shutdown');
  };
}
