/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

const RelayRecordSourceInspector = require('relay-runtime/lib/RelayRecordSourceInspector');

import type { ConcreteBatch } from 'RelayConcreteNode';
import type { DataID } from 'RelayInternalTypes';
import type { RecordSummaryType } from 'RelayRecordSourceInspector';
import type { Environment } from 'RelayStoreTypes';
import type { Variables } from 'RelayTypes';

type MatchType = 'idtype' | 'id' | 'type' | 'predicate';

export type UpdateEvent = {
  eventName: string,
  seriesId: string,
  operation: ConcreteBatch,
  variables: Variables,
  payload: any,
  snapshotBefore: any,
  snapshotAfter: any,
};

type EmitFn = (name: string, data: { [key: string]: mixed }) => void;

/**
 * Agent:
 *
 * Responsible for listening to events on and exposing an inspection API for
 * a Relay Environment.
 */
export default class EnvironmentAgent {
  _environment: Environment;
  _emit: EmitFn;
  _id: string;
  _beforeSnapshot: any;
  _lastNetworkEvent: ?UpdateEvent;
  _flushLastNetworkEventTimer: number;

  constructor(environment: Environment, id: string, emit: EmitFn): void {
    this._environment = environment;
    this._id = id;
    this._emit = emit;
    this._beforeSnapshot = this._getSnapshot();

    // Monkey patch methods within Environment to follow various events.
    this._monkeyPatchExecute();
    this._monkeyPatchExecuteMutation();
    this._monkeyPatchNetwork();
    this._monkeyPatchPublishQueue();
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
  ): Array<RecordSummaryType> {
    const inspector = RelayRecordSourceInspector.getForEnvironment(
      this._environment,
    );

    function isMatching(record: RecordSummaryType): boolean {
      if (matchType === 'idtype') {
        return (
          record.id.includes(matchStr) ||
          (Boolean(record.type) && record.type.includes(matchStr))
        );
      }
      if (matchType === 'id') {
        return record.id.includes(matchStr);
      }
      if (matchType === 'type') {
        return Boolean(record.type) && record.type.includes(matchStr);
      }
      if (matchType === 'predicate') {
        const recordInspector = inspector.get(record.id);
        const fields = recordInspector && recordInspector.inspect();
        if (typeof fields === 'object' && fields !== null) {
          throw new Error('Not implemented');
        }
        return false;
      }
      throw new Error('Unknown match type: ' + matchType);
    }

    return inspector.getRecords().filter(isMatching);
  }

  getRecord(id: DataID) {
    const inspector = RelayRecordSourceInspector.getForEnvironment(
      this._environment,
    );
    const recordInspector = inspector.get(id);
    return recordInspector && recordInspector.inspect();
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
  _monkeyPatchExecuteUnsubscribe(execute) {
    const agent = this;
    return function() {
      const observable = execute.apply(this, arguments);
      // Get the network event corresponding to the "Request" start.
      const lastNetworkEvent = agent._lastNetworkEvent;
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
    const agent = this;
    monkeyPatch(
      this._environment._network,
      'execute',
      execute =>
        function(operation, variables) {
          const seriesId = nextSeriesId();
          agent._networkEvent({
            eventName: 'Request',
            seriesId,
            operation,
            variables,
          });
          const observable = execute.apply(this, arguments);
          return observable.do({
            next: response =>
              agent._networkEvent({
                eventName: 'Response',
                seriesId,
                operation,
                variables,
                response,
              }),
            error: error =>
              agent._networkEvent({
                eventName: 'Request Error',
                seriesId,
                operation,
                variables,
                response: { isError: true, message: error.message },
              }),
          });
        },
    );
  }

  _monkeyPatchPublishQueue() {
    const agent = this;
    monkeyPatch(
      this._environment._publishQueue,
      'run',
      run =>
        function() {
          run.apply(this, arguments);
          agent._runPublishEvent();
        },
    );
  }

  _networkEvent(partialEvent: UpdateEvent) {
    if (this._flushLastNetworkEventTimer) {
      this._flushLastNetworkEvent();
    }
    this._lastNetworkEvent = partialEvent;
    this._flushLastNetworkEventTimer = setTimeout(() =>
      this._flushLastNetworkEvent(),
    );
  }

  _flushLastNetworkEvent() {
    const data: UpdateEvent = this._lastNetworkEvent;
    this._clearLastNetworkEvent();
    this._emit('update', data);
  }

  _clearLastNetworkEvent() {
    clearTimeout(this._flushLastNetworkEventTimer);
    this._lastNetworkEvent = null;
    this._flushLastNetworkEventTimer = null;
  }

  _runPublishEvent() {
    const lastNetworkEvent = this._lastNetworkEvent;
    const networkEventName = lastNetworkEvent && lastNetworkEvent.eventName;
    const eventName =
      networkEventName === 'Request'
        ? 'Optimistic Update'
        : networkEventName === 'Unsubscribe'
          ? 'Revert Optimistic Update'
          : networkEventName ? networkEventName : 'Local Update';
    const seriesId = lastNetworkEvent
      ? lastNetworkEvent.seriesId
      : nextSeriesId();
    const afterSnapshot = this._getSnapshot();
    const data: UpdateEvent = {
      ...lastNetworkEvent,
      eventName,
      seriesId,
      snapshotBefore: this._beforeSnapshot,
      snapshotAfter: afterSnapshot,
    };
    this._beforeSnapshot = afterSnapshot;
    this._clearLastNetworkEvent();
    this._emit('update', data);
  }

  _getSnapshot() {
    const source = this._environment.getStore().getSource();
    const snapshot = {};
    const ids = source.getRecordIDs();
    ids.forEach(id => {
      const record = source.get(id);
      if (record) {
        snapshot[id] = record;
      }
    });
    return snapshot;
  }
}

function monkeyPatch(source, method, patch) {
  source[method] = patch(source[method]);
}

let seriesIdCounter = 0;
const seriesIdPrefix = Math.random()
  .toString(16)
  .slice(-5);
function nextSeriesId() {
  return seriesIdPrefix + seriesIdCounter++;
}
