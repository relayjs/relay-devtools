/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * Hook:
 *
 * Responsible for installing itself as a global variable which Relay
 * Environment instances will look for to register themselves, and which
 * connectBackend will use to find environments.
 */

'use strict';

import type {Environment} from 'relay-runtime';

export type GlobalHook = {
  /**
   * Called by RelayEnvironment during initialization.
   */
  registerEnvironment(environment: Environment): void,

  /**
   * Called by Relay Devtools to get currently detected Relay Environments,
   * in case Relay initializes before Devtools.
   */
  getEnvironments(): Array<Environment>,

  /**
   * Called by Relay Devtools to subscribe to future detected Relay
   * Environments, in case Devtools initializes before Relay.
   */
  onEnvironment(listener: (Environment) => mixed): void,
};

export function installGlobalHook(target: any): boolean {
  if (target.hasOwnProperty('__RELAY_DEVTOOLS_HOOK__')) {
    return false;
  }
  // const environments = new Set();
  let listeners = {};

  const hook: GlobalHook = {
    _environments: new Set(),
    _agents: new Map(),
    _listeners: {},
    _pending: new Set(),
    registerEnvironment(environment) {
      window.__RELAY_DEVTOOLS_HOOK__.emit('hasDetectedReact', {
        environment: 'test',
      });
      hook._environments.add(environment);
      const id = hook._environments.size - 1;
      const emit = function(name, data) {
        hook.emit(name, Object.assign({}, data, {environment: id}));
      };

      const agent = new EnvironmentAgent(environment, id, emit);
      hook._agents.set(id, agent);

      // ****************************************************
      function EnvironmentAgent(
        environment: Environment,
        id: string,
        emit: EmitFn,
      ) {
        let seriesIdCounter = 0;
        const seriesIdPrefix = Math.random()
          .toString(16)
          .slice(-5);

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
          ids.forEach(idx => {
            snapshot[idx] = deepCopy(source.get(idx));
          });
          return snapshot;
        }

        function deepCopy(value) {
          if (Array.isArray(value)) {
            return value.map(deepCopy);
          }
          if (value && value instanceof Object) {
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

        this.getEnvironment = function(): Environment {
          return this._environment;
        };

        this.setEmitFunction = function(_emit) {
          this._emit = _emit;
        };

        this.getId = function(): string {
          return this._id;
        };
        this.getMatchingRecords = function(
          matchStr: string,
          matchType: MatchType,
        ) {
          function isMatching(dataID: DataID, record: Record): boolean {
            if (matchType === 'idtype') {
              return (
                dataID.includes(matchStr) ||
                (Boolean(record.__typename) &&
                  record.__typename.includes(matchStr))
              );
            }
            if (matchType === 'id') {
              return dataID.includes(matchStr);
            }
            if (matchType === 'type') {
              return (
                Boolean(record.__typename) &&
                record.__typename.includes(matchStr)
              );
            }
            throw new Error('Unknown match type: ' + matchType);
          }

          const source = this._environment.getStore().getSource();
          const recordMap = {};
          source.getRecordIDs().forEach(recordID => {
            const record = source.get(recordID);
            if (isMatching(recordID, record)) {
              recordMap[recordID] = record.__typename;
            }
          });
          return recordMap;
        };
        this.getRecord = function(dataID: DataID): Record {
          return deepCopy(
            this._environment
              .getStore()
              .getSource()
              .get(dataID),
          );
        };
        this.getGCData = function() {
          const store = this._environment.getStore();
          return {
            _gcEnabled: store._gcEnabled,
            _hasScheduledGC: store._hasScheduledGC,
          };
        };

        this._monkeyPatchExecute = function() {
          monkeyPatch(this._environment, 'execute', execute =>
            this._monkeyPatchExecuteUnsubscribe(execute),
          );
        };

        this._monkeyPatchExecuteMutation = function() {
          monkeyPatch(this._environment, 'executeMutation', executeMutation =>
            this._monkeyPatchExecuteUnsubscribe(executeMutation),
          );
        };

        // When monkey-patching the network, "unsubscribe" events occur *after*
        // the corresponding publish, rather than *before* as "next" and "error"
        // events. To account for this, we monkey-patch environment's execute() and
        // executeMutation() methods for their "unsubscribe" events, which do in
        // fact occur *before* the corresponding publish.

        this._monkeyPatchExecuteUnsubscribe = function(execute: $FlowFixMe) {
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
        };

        this._monkeyPatchNetwork = function() {
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
        };

        this._monkeyPatchStoreNotify = function() {
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
        };

        this._networkEvent = function(partialEvent: UpdateEvent) {
          if (this._flushLastNetworkEventTimer) {
            this._flushLastNetworkEvent();
          }
          this._lastNetworkEvent = partialEvent;
          // $FlowFixMe
          this._flushLastNetworkEventTimer = setTimeout(() =>
            this._flushLastNetworkEvent(),
          );
        };

        this._flushLastNetworkEvent = function() {
          // $FlowFixMe
          const data: UpdateEvent = this._lastNetworkEvent;
          this._clearLastNetworkEvent();
          // $FlowFixMe
          this._emit('update', data);
        };

        this._clearLastNetworkEvent = function() {
          // $FlowFixMe
          clearTimeout(this._flushLastNetworkEventTimer);
          this._lastNetworkEvent = null;
          this._flushLastNetworkEventTimer = null;
        };

        this._runPublishEvent = function() {
          const store = this._environment.getStore();
          const lastNetworkEvent = this._lastNetworkEvent;
          const networkEventName =
            lastNetworkEvent && lastNetworkEvent.eventName;
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
          const data: UpdateEvent = Object.assign(
            {},
            lastNetworkEvent,
            snapshotChanges,
            {
              // ...lastNetworkEvent,
              // ...snapshotChanges,
              eventName,
              seriesId,
            },
          );
          this._clearLastNetworkEvent();
          this._emit('update', data);
        };

        this._monkeyPatchExecuteMutation();
        this._monkeyPatchStoreNotify();
        this._monkeyPatchNetwork();
        this._monkeyPatchExecute();
      }
      // ****************************************************
      // hook.emit('registerEnvironment', {
      //   // hook._environments.size - 1
      //   environment: JSON.stringify(environment),
      // });
      // listeners.forEach(listener =>
      //   listener(hook._environments, hook._environments.size - 1),
      // );

      hook.on('update', data => {
        this._pending.add({event: 'update', data});
      });
    },

    getEnvironments() {
      return Array.from(hook._environments);
    },

    // onEnvironment(listener) {
    //   listeners.push(listener);
    // },

    _buffer: [],

    _replayBuffer(event) {
      const buffer = this._buffer;
      this._buffer = [];

      for (let i = 0, l = buffer.length; i < l; i++) {
        const allArgs = buffer[i];
        allArgs[0] === event
          ? this.emit.apply(this, allArgs)
          : this._buffer.push(allArgs);
      }
    },

    on(event, fn) {
      const $event = '$' + event;
      if (listeners[$event]) {
        listeners[$event].push(fn);
      } else {
        listeners[$event] = [fn];
        this._replayBuffer(event);
      }
    },

    once(event, fn) {
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }
      this.on(event, on);
    },

    off(event, fn) {
      event = '$' + event;
      if (!arguments.length) {
        listeners = {};
      } else {
        const cbs = listeners[event];
        if (cbs) {
          if (!fn) {
            listeners[event] = null;
          } else {
            for (let i = 0, l = cbs.length; i < l; i++) {
              const cb = cbs[i];
              if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1);
                break;
              }
            }
          }
        }
      }
    },

    emit(event) {
      const $event = '$' + event;
      let cbs = listeners[$event];
      if (cbs) {
        const eventArgs = [].slice.call(arguments, 1);
        cbs = cbs.slice();
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(this, eventArgs);
        }
      } else {
        const allArgs = [].slice.call(arguments);
        this._buffer.push(allArgs);
      }
    },
  };

  Object.defineProperty(window, '__RELAY_DEVTOOLS_HOOK__', {
    value: hook,
  });
}

export function getGlobalHook(window: any): ?GlobalHook {
  return window && window.__RELAY_DEVTOOLS_HOOK__;
}
