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

import type { DataID } from 'RelayInternalTypes';
import type { RecordSummaryType } from 'RelayRecordSourceInspector';
import type { Environment, OperationSelector } from 'RelayStoreTypes';

type MatchType = 'idtype' | 'id' | 'type' | 'predicate';

type MutationEvent = {
  snapshotBefore: any,
  snapshotAfter: any,
  eventName: string,
  mutation: OperationSelector,
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
  _isRecordingMutationEvents: boolean;
  _recordedMutationEvents: Array<MutationEvent>;

  constructor(environment: Environment, id: string, emit: EmitFn): void {
    this._environment = environment;
    this._id = id;
    this._emit = emit;
    this._recordedMutationEvents = [];
    this._isRecordingMutationEvents = false;

    // Monkey patch methods within Environment to follow various events.
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

  _monkeyPatchPublishQueue() {
    const emit = this._emit;
    monkeyPatch(
      this._environment._publishQueue,
      'run',
      run =>
        function() {
          run.apply(this, arguments);
          emit('dirty');
        },
    );
  }

  startRecordingMutationEvents() {
    this._isRecordingMutationEvents = true;
    this._recordedMutationEvents = [];
  }

  stopRecordingMutationEvents() {
    this._isRecordingMutationEvents = false;
  }

  getRecordedMutationEvents(): Array<MutationEvent> {
    return this._recordedMutationEvents;
  }

  recordMutationEvent({
    eventName,
    seriesId,
    payload,
    mutation,
    fn,
  }: {
    eventName: string,
    seriesId: string,
    payload: any,
    mutation: OperationSelector,
    fn: () => void,
  }) {
    if (this._isRecordingMutationEvents) {
      const source = this._environment.getStore().getSource();
      const getSnapshot = () => {
        const snapshot = {};
        const ids = source.getRecordIDs();
        ids.forEach(id => {
          snapshot[id] = source.get(id);
        });
        return snapshot;
      };

      const snapshotBefore = getSnapshot();
      fn();
      const snapshotAfter = getSnapshot();

      const event = {
        eventName,
        seriesId,
        payload,
        snapshotBefore,
        snapshotAfter,
        mutation,
      };

      this._recordedMutationEvents.push(event);
    } else {
      fn();
    }
  }
}

function monkeyPatch(source, method, patch) {
  source[method] = patch(source[method]);
}
