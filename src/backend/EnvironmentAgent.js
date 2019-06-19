/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Agent:
 *
 * Responsible for listening to events on and exposing an inspection API for
 * a Relay Environment.
 */

'use strict';

// import deepCopy from './deepCopy';

// import type {Record} from 'RelayCombinedEnvironmentTypes';
// import type {ConcreteBatch} from 'RelayConcreteNode';
// import type {DataID} from 'RelayInternalTypes';
// import type {Environment} from 'RelayStoreTypes';
// import type {Variables} from 'RelayTypes';
type Record = $FlowFixMe;
type ConcreteBatch = $FlowFixMe;
type DataID = $FlowFixMe;
type Environment = $FlowFixMe;
type Variables = $FlowFixMe;

type MatchType = 'idtype' | 'id' | 'type';

export type UpdateEvent = {
  eventName: string,
  seriesId: string,
  operation: ConcreteBatch,
  variables: Variables,
  payload: any,
  snapshotBefore: any,
  snapshotAfter: any,
};

type EmitFn = (name: string, data: {+[key: string]: mixed}) => void;

function getSnapshotChanges(store, snapshot, updatedRecordIds) {
  const snapshotBefore = {};
  const snapshotAfter = {};
  const source = store.getSource();
  const ids = Object.keys(updatedRecordIds);
  for (let ii = 0; ii < ids.length; ii++) {
    const id = ids[ii];
    const beforeRecord = snapshot[id];
    if (beforeRecord !== undefined) {
      snapshotBefore[id] = beforeRecord;
    }
    // Always include records in "after", even if they're null.
    snapshotAfter[id] = snapshot[id] = deepCopy(source.get(id));
  }
  return {snapshotBefore, snapshotAfter};
}

let seriesIdCounter = 0;
const seriesIdPrefix = Math.random()
  .toString(16)
  .slice(-5);

function getNextSeriesID() {
  return seriesIdPrefix + seriesIdCounter++;
}
function monkeyPatch(source, method, patch) {
  source[method] = patch(source[method]);
}

function getInitialSnapshot(store) {
  const snapshot = {};
  const source = store.getSource();
  const ids = source.getRecordIDs();
  ids.forEach(id => {
    snapshot[id] = deepCopy(source.get(id));
  });
  return snapshot;
}

function deepCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepCopy);
  }
  if (value && typeof value === 'object') {
    const copy = {};
    for (const prop in value) {
      if (hasOwnProperty.call(value, prop)) {
        copy[prop] = deepCopy(value[prop]);
      }
    }
    // $FlowFixMe
    return copy;
  }
  return value;
}

export default class EnvironmentAgent {
  _environment: Environment;
  _id: string;
  _emit: EmitFn;
  _snapshot: any;
  _lastNetworkEvent: ?UpdateEvent;
  _flushLastNetworkEventTimer: ?number;
  _network: any;

  constructor(environment: Environment, id: string, emit: EmitFn): void {
    this._environment = environment;
    this._id = id;
    this._emit = emit;
    this._snapshot = getInitialSnapshot(environment.getStore());
    this._network = environment.getNetwork();
    // this._emit('log', {
    //   network: JSON.stringify(this._network),
    //   snapshot: this._snapshot,
    //   id: this._id,
    // });
    // Monkey patch methods within Environment to follow various events.

    this._monkeyPatchExecuteMutation();
    this._monkeyPatchStoreNotify();
    this._monkeyPatchNetwork();
    this._monkeyPatchExecute();
  }

  getEnvironment(): Environment {
    return this._environment;
  }

  getId(): string {
    return this._id;
  }

  getMatchingRecords(
    matchStr: string,
    matchType: MatchType,
  ): {[id: string]: string} {
    function isMatching(id: DataID, record: Record): boolean {
      if (matchType === 'idtype') {
        return (
          id.includes(matchStr) ||
          (Boolean(record.__typename) && record.__typename.includes(matchStr))
        );
      }
      if (matchType === 'id') {
        return id.includes(matchStr);
      }
      if (matchType === 'type') {
        return (
          Boolean(record.__typename) && record.__typename.includes(matchStr)
        );
      }
      throw new Error('Unknown match type: ' + matchType);
    }

    const source = this._environment.getStore().getSource();
    const recordMap = {};
    source.getRecordIDs().forEach(id => {
      const record = source.get(id);
      if (isMatching(id, record)) {
        recordMap[id] = record.__typename;
      }
    });
    return recordMap;
  }

  getRecord(id: DataID): Record {
    return deepCopy(
      this._environment
        .getStore()
        .getSource()
        .get(id),
    );
  }

  getGCData() {
    const store = this._environment.getStore();
    return {
      _gcEnabled: store._gcEnabled,
      _hasScheduledGC: store._hasScheduledGC,
    };
  }

  setEmitFunction(emit: EmitFn) {
    this._emit = emit;
  }

  _monkeyPatchExecute() {
    monkeyPatch(this._environment, 'execute', execute =>
      this._monkeyPatchExecuteUnsubscribe(execute),
    );
  }

  _monkeyPatchExecuteMutation() {
    monkeyPatch(this._environment, 'executeMutation', executeMutation =>
      this._monkeyPatchExecuteUnsubscribe(executeMutation),
    );
  }

  // When monkey-patching the network, "unsubscribe" events occur *after*
  // the corresponding publish, rather than *before* as "next" and "error"
  // events. To account for this, we monkey-patch environment's execute() and
  // executeMutation() methods for their "unsubscribe" events, which do in fact
  // occur *before* the corresponding publish.
  _monkeyPatchExecuteUnsubscribe(execute: $FlowFixMe) {
    const agent = this;

    return function() {
      const observable = execute.apply(this, arguments);
      // Get the network event corresponding to the "Request" start.
      const lastNetworkEvent = agent._lastNetworkEvent;
      return observable.do({
        unsubscribe: () =>
          // Produce a mirrored "Unsubscribe" network event.
          agent._networkEvent(
            Object.assign({}, lastNetworkEvent, {
              eventName: 'Unsubscribe',
            }),
          ),
      });
    };
  }

  _monkeyPatchNetwork() {
    const agent = this;
    monkeyPatch(
      this._environment.getNetwork(),
      'execute',
      execute =>
        function(operation, variables) {
          const seriesId = getNextSeriesID();
          // $FlowFixMe
          agent._networkEvent({
            eventName: 'Request',
            seriesId,
            operation,
            variables,
          });
          const observable = execute.apply(this, arguments);
          return observable.do({
            next: payload => {
              // $FlowFixMe
              return agent._networkEvent({
                eventName: 'Response',
                seriesId,
                operation,
                variables,
                response: payload.response || payload,
              });
            },
            error: error =>
              // $FlowFixMe
              agent._networkEvent({
                eventName: 'Request Error',
                seriesId,
                operation,
                variables,
                response: {isError: true, message: error.message},
              }),
          });
        },
    );
  }

  _monkeyPatchStoreNotify() {
    const agent = this;
    monkeyPatch(
      this._environment.getStore(),
      'notify',
      notify =>
        function() {
          agent._runPublishEvent();
          notify.apply(this, arguments);
        },
    );
  }

  _networkEvent(partialEvent: UpdateEvent) {
    if (this._flushLastNetworkEventTimer) {
      this._flushLastNetworkEvent();
    }
    this._lastNetworkEvent = partialEvent;
    // $FlowFixMe
    this._flushLastNetworkEventTimer = setTimeout(() =>
      this._flushLastNetworkEvent(),
    );
  }

  _flushLastNetworkEvent() {
    // $FlowFixMe
    const data: UpdateEvent = this._lastNetworkEvent;
    this._clearLastNetworkEvent();
    // $FlowFixMe
    this._emit('update', data);
  }

  _clearLastNetworkEvent() {
    // $FlowFixMe
    clearTimeout(this._flushLastNetworkEventTimer);
    this._lastNetworkEvent = null;
    this._flushLastNetworkEventTimer = null;
  }

  _runPublishEvent() {
    const store = this._environment.getStore();
    const lastNetworkEvent = this._lastNetworkEvent;
    const networkEventName = lastNetworkEvent && lastNetworkEvent.eventName;
    const eventName =
      networkEventName === 'Request'
        ? 'Optimistic Update'
        : networkEventName === 'Unsubscribe'
        ? 'Revert Optimistic Update'
        : networkEventName
        ? networkEventName
        : 'Local Update';
    const seriesId = lastNetworkEvent
      ? lastNetworkEvent.seriesId
      : getNextSeriesID();
    const snapshotChanges = getSnapshotChanges(
      store,
      this._snapshot,
      store.__getUpdatedRecordIDs(),
    );
    const data: UpdateEvent = {
      ...lastNetworkEvent,
      ...snapshotChanges,
      eventName,
      seriesId,
    };
    this._clearLastNetworkEvent();
    this._emit('update', data);
  }
}
