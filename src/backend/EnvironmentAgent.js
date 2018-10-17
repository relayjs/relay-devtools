/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

import deepCopy from './deepCopy';

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

type EmitFn = (name: string, data: {[key: string]: mixed}) => void;

export default class EnvironmentAgent {
  _environment: Environment;
  _id: string;
  _emit: EmitFn;
  _snapshot: any;
  _lastNetworkEvent: ?UpdateEvent;
  _flushLastNetworkEventTimer: ?number;

 function getSnapshotChanges(store, snapshot, updatedRecordIds) {
  console.info('[CLIENT] EnvironmentAgent.getSnapshotChanges');
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
  console.info('[CLIENT] EnvironmentAgent.nextSeriesId');
  return seriesIdPrefix + seriesIdCounter++;
}
 function monkeyPatch(source, method, patch) {
  console.info('[CLIENT] EnvironmentAgent.monkeyPatch');
  source[method] = patch(source[method]);
}

 function getInitialSnapshot(store) {
  console.info('[CLIENT] EnvironmentAgent.getInitialSnapshot');
  const snapshot = {};
  const source = store.getSource();
  const ids = source.getRecordIDs();
  ids.forEach(id => {
    snapshot[id] = deepCopy(source.get(id));
  });
  return snapshot;
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
     console.info('[CLIENT] EnvironmentAgent.constructor');
     this._environment = environment;
     this._id = id;
     this._emit = emit;
     this._snapshot = getInitialSnapshot(environment.getStore());
     console.log('this._snapshot', this._snapshot);

     this._network = environment.getNetwork();
     console.log('this._network', this._network);
     // Monkey patch methods within Environment to follow various events.
     this._monkeyPatchNetwork();
     this._monkeyPatchExecute();
     this._monkeyPatchExecuteMutation();
     this._monkeyPatchStoreNotify();
   }

   getEnvironment(): Environment {
     console.info('[CLIENT] EnvironmentAgent.getEnvironment');
     return this._environment;
   }

   getId(): string {
     console.info('[CLIENT] EnvironmentAgent.getId');
     return this._id;
   }

   getMatchingRecords(
     matchStr: string,
     matchType: MatchType,
   ): {[id: string]: string} {
     console.info('[CLIENT] EnvironmentAgent.getMatchingRecords');
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
     console.info('[CLIENT] EnvironmentAgent.getRecord');
     return deepCopy(
       this._environment
         .getStore()
         .getSource()
         .get(id),
     );
   }

   getGCData() {
     console.info('[CLIENT] EnvironmentAgent.getGCData');
     const store = this._environment.getStore();
     return {
       _gcEnabled: store._gcEnabled,
       _hasScheduledGC: store._hasScheduledGC,
     };
   }

   _monkeyPatchExecute() {
     console.info('[CLIENT] EnvironmentAgent._monkeyPatchExecute');
     monkeyPatch(this._environment, 'execute', execute =>
       this._monkeyPatchExecuteUnsubscribe(execute),
     );
   }

   _monkeyPatchExecuteMutation() {
     console.info('[CLIENT] EnvironmentAgent._monkeyPatchExecuteMutation');
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
     console.info(
       '[CLIENT] EnvironmentAgent._monkeyPatchExecuteUnsubscribe',
       JSON.stringify(this),
     );
     const agent = this;

     return function() {
       const observable = execute.apply(this, arguments);
       // Get the network event corresponding to the "Request" start.
       const lastNetworkEvent = agent._lastNetworkEvent;
       console.info(
         '[CLIENT] EnvironmentAgent.lastNetworkEvent',
         JSON.stringify(lastNetworkEvent),
       );
       return observable.do({
         unsubscribe: () =>
           // Produce a mirrored "Unsubscribe" network event.
           agent._networkEvent({
             ...lastNetworkEvent,
             eventName: 'Unsubscribe',
           }),
       });
     };
   }

   _monkeyPatchNetwork() {
     console.info('[CLIENT nice] EnvironmentAgent._monkeyPatchNetwork');
     const agent = this;
     monkeyPatch(
       this._environment.getNetwork(),
       'execute',
       execute =>
         function(operation, variables) {
           console.log('EnvironmentAgent!!!!!!!', operation, variables);
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
               // console.log(payload);
               console.info(
                 '[CLIENT] EnvironmentAgent._monkeyPatchNetwork',
                 operation,
               );
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
     console.info('[CLIENT] EnvironmentAgent._monkeyPatchStoreNotify');
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
     console.info('[CLIENT] EnvironmentAgent._networkEvent', partialEvent);
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
     console.info('[CLIENT] EnvironmentAgent._flushLastNetworkEvent');
     // $FlowFixMe
     const data: UpdateEvent = this._lastNetworkEvent;
     console.info(
       '[CLIENT] EnvironmentAgent._flushLastNetworkEvent, ',
       JSON.stringify(data),
     );
     this._clearLastNetworkEvent();
     // $FlowFixMe
     this._emit('update', data);
   }

   _clearLastNetworkEvent() {
     console.info('[CLIENT] EnvironmentAgent._clearLastNetworkEvent');
     // $FlowFixMe
     clearTimeout(this._flushLastNetworkEventTimer);
     this._lastNetworkEvent = null;
     this._flushLastNetworkEventTimer = null;
   }

   _runPublishEvent() {
     console.info(
       '[CLIENT] EnvironmentAgent._runPublishEvent, ',
       JSON.stringify(this),
     );
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
