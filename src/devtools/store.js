/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import EventEmitter from 'events';
import type { FrontendBridge } from 'src/bridge';
import { __DEBUG__ } from '../constants';
import type {
  DataID,
  LogEvent,
  EventData,
  EnvironmentInfo,
  StoreData,
  StoreRecords,
  Record,
} from '../types';

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
  environmentInitialized: [],
  mutated: [],
  storeDataReceived: [],
  recordChangeDescriptions: [],
  roots: [],
|}> {
  _bridge: FrontendBridge;

  _environmentEventsMap: Map<number, Array<LogEvent>> = new Map();
  _environmentNames: Map<number, string> = new Map();
  _environmentStoreData: Map<number, StoreRecords> = new Map();
  _environmentStoreOptimisticData: Map<number, StoreRecords> = new Map();
  _environmentAllEvents: Map<number, Array<LogEvent>> = new Map();

  constructor(bridge: FrontendBridge) {
    super();
    this._bridge = bridge;
    bridge.addListener('events', this.onBridgeEvents);
    bridge.addListener('shutdown', this.onBridgeShutdown);
    bridge.addListener('environmentInitialized', this.onBridgeEnvironmentInit);
    bridge.addListener('storeRecords', this.onBridgeStoreSnapshot);
  }

  getAllEvents(): $ReadOnlyArray<LogEvent> {
    let allEvents = [];
    this._environmentAllEvents.forEach((value, _) => allEvents.push(...value));
    return allEvents;
  }

  getEvents(environmentID: number): ?$ReadOnlyArray<LogEvent> {
    return this._environmentAllEvents.get(environmentID);
  }

  getAllEnvironmentEvents(): $ReadOnlyArray<LogEvent> {
    let allEnvironmentEvents = [];
    this._environmentEventsMap.forEach((value, _) =>
      allEnvironmentEvents.push(...value)
    );
    return allEnvironmentEvents;
  }

  getEnvironmentEvents(environmentID: number): ?$ReadOnlyArray<LogEvent> {
    return this._environmentEventsMap.get(environmentID);
  }

  getEnvironmentIDs(): $ReadOnlyArray<number> {
    return Array.from(this._environmentNames.keys());
  }

  getEnvironmentName(environmentID: number): ?string {
    return this._environmentNames.get(environmentID);
  }

  getRecords(environmentID: number): ?StoreRecords {
    return this._environmentStoreData.get(environmentID);
  }

  getRecordIDs(environmentID: number): ?$ReadOnlyArray<string> {
    const storeRecords = this._environmentStoreData.get(environmentID);
    return storeRecords ? Object.keys(storeRecords) : null;
  }

  removeRecord(environmentID: number, recordID: string) {
    const storeRecords = this._environmentStoreData.get(environmentID);
    if (storeRecords != null) {
      delete storeRecords[recordID];
    }
  }

  getAllRecords(): ?$ReadOnlyArray<StoreRecords> {
    return Array.from(this._environmentStoreData.values());
  }

  getOptimisticUpdates(environmentID: number): ?StoreRecords {
    return this._environmentStoreOptimisticData.get(environmentID);
  }

  mergeRecords(id: number, newRecords: ?StoreRecords) {
    if (newRecords == null) {
      return;
    }
    let oldRecords = this._environmentStoreData.get(id);
    if (oldRecords == null) {
      this._environmentStoreData.set(id, newRecords);
      return;
    }
    const dataIDs = Object.keys(newRecords);

    for (let ii = 0; ii < dataIDs.length; ii++) {
      const dataID = dataIDs[ii];
      const oldRecord = oldRecords[dataID];
      const newRecord = newRecords[dataID];
      if (oldRecord && newRecord) {
        let updated: Record | null = null;
        const keys = Object.keys(newRecord);
        for (let iii = 0; iii < keys.length; iii++) {
          const key = keys[iii];
          if (updated || oldRecord[key] !== newRecord[key]) {
            updated = updated !== null ? updated : { ...oldRecord };
            updated[key] = newRecord[key];
          }
        }
        updated = updated !== null ? updated : oldRecord;
        if (updated !== newRecord) {
          oldRecords[dataID] = updated;
        }
      } else if (oldRecord == null) {
        oldRecords[dataID] = newRecord;
      } else if (newRecord == null) {
        delete oldRecords[dataID];
      }
    }
    this._environmentStoreData.set(id, oldRecords);
  }

  mergeOptimisticRecords(id: number, newRecords: ?StoreRecords) {
    if (newRecords == null) {
      return;
    }
    let oldRecords = this._environmentStoreOptimisticData.get(id);
    if (oldRecords == null) {
      this._environmentStoreOptimisticData.set(id, newRecords);
      return;
    }
    const dataIDs = Object.keys(newRecords);

    for (let ii = 0; ii < dataIDs.length; ii++) {
      const dataID = dataIDs[ii];
      const oldRecord = oldRecords[dataID];
      const newRecord = newRecords[dataID];
      if (oldRecord && newRecord) {
        let updated: Record | null = null;
        const keys = Object.keys(newRecord);
        for (let iii = 0; iii < keys.length; iii++) {
          const key = keys[iii];
          if (updated || oldRecord[key] !== newRecord[key]) {
            updated = updated !== null ? updated : { ...oldRecord };
            updated[key] = newRecord[key];
          }
        }
        updated = updated !== null ? updated : oldRecord;
        if (updated !== newRecord) {
          oldRecords[dataID] = updated;
        }
      } else if (oldRecord == null) {
        oldRecords[dataID] = newRecord;
      } else if (newRecord == null) {
        delete oldRecords[dataID];
      }
    }
    this._environmentStoreOptimisticData.set(id, oldRecords);
  }

  onBridgeStoreSnapshot = (data: Array<StoreData>) => {
    for (let { id, records } of data) {
      this._environmentStoreData.set(id, records);
      this.emit('storeDataReceived');
    }
  };

  setStoreEvents = (id: number, data: LogEvent) => {
    switch (data.name) {
      case 'store.publish':
        this.mergeRecords(id, data.source);
        if (data.optimistic) {
          this.mergeOptimisticRecords(id, data.source);
        }
        break;
      case 'store.restore':
        this.clearOptimisticUpdates(id);
        break;
      case 'store.gc':
        this.garbageCollectRecords(id, data.references);
        break;
      default:
        break;
    }
    this.emit('storeDataReceived');
  };

  setEnvironmentEvents = (id: number, data: LogEvent) => {
    let arr = this._environmentEventsMap.get(id);
    if (arr) {
      arr.push(data);
    } else {
      this._environmentEventsMap.set(id, [data]);
    }
    this.emit('mutated');
  };

  onBridgeEvents = (events: Array<EventData>) => {
    for (let { id, data, eventType } of events) {
      if (eventType === 'store') {
        this.setStoreEvents(id, data);
      } else if (eventType === 'environment') {
        this.setEnvironmentEvents(id, data);
      }
      let allEvents = this._environmentAllEvents.get(id);
      if (allEvents) {
        allEvents.push(data);
      } else {
        this._environmentAllEvents.set(id, [data]);
      }
    }
  };

  onBridgeEnvironmentInit = (data: Array<EnvironmentInfo>) => {
    for (let { id, environmentName } of data) {
      this._environmentNames.set(id, environmentName);
    }
    this.emit('environmentInitialized');
  };

  clearOptimisticUpdates = (envID: number) => {
    this._environmentStoreOptimisticData.delete(envID);
  };

  garbageCollectRecords = (
    envID: number,
    references: $ReadOnlyArray<DataID>
  ) => {
    if (references.length === 0) {
      this._environmentStoreData.delete(envID);
    } else {
      const storeIDs = this.getRecordIDs(envID);
      if (storeIDs == null) {
        return;
      }
      for (let dataID of storeIDs) {
        if (!references.includes(dataID)) {
          this.removeRecord(envID, dataID);
        }
      }
    }
  };

  clearAllEvents = () => {
    this._environmentEventsMap.forEach((_, key) => this.clearEvents(key));
    this.emit('mutated');
  };

  clearEvents = (environmentID: number) => {
    const completed = new Set();
    let eventArray = this._environmentEventsMap.get(environmentID);
    if (eventArray !== undefined && eventArray.length > 0) {
      for (const event of eventArray) {
        if (
          event.name === 'execute.complete' ||
          event.name === 'execute.error' ||
          event.name === 'execute.unsubscribe'
        ) {
          completed.add(event.transactionID);
        }
      }
      eventArray = eventArray.filter(
        event =>
          event.name !== 'queryresource.fetch' &&
          event.name !== 'store.publish' &&
          event.name !== 'store.restore' &&
          event.name !== 'store.gc' &&
          !completed.has(event.transactionID)
      );
      this._environmentEventsMap.set(environmentID, eventArray);
      this.emit('mutated');
    }
  };

  onBridgeShutdown = () => {
    if (__DEBUG__) {
      debug('onBridgeShutdown', 'unsubscribing from Bridge');
    }

    this._bridge.removeListener('events', this.onBridgeEvents);
    this._bridge.removeListener('shutdown', this.onBridgeShutdown);
    this._bridge.removeListener(
      'environmentInitialized',
      this.onBridgeEnvironmentInit
    );
    this._bridge.removeListener('storeRecords', this.onBridgeStoreSnapshot);
  };
}
