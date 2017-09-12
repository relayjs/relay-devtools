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

import EnvironmentAgent from './EnvironmentAgent';

import type { Environment } from 'RelayRuntime';
import type { GlobalHook } from './GlobalHook';
import type Bridge from '../transport/Bridge';

/**
 * connectBackend:
 *
 * Given a Hook and a Bridge, create Agents for every Relay Environment found,
 * and attach Bridge callbacks to Agent methods.
 */
export default function connectBackend(hook: GlobalHook, bridge: Bridge): void {
  const agents = [];

  function connectAgent(environment: Environment): void {
    const id = agents.length;
    function emit(name, data) {
      bridge.emit(name, { ...data, environment: id });
    }
    const agent = new EnvironmentAgent(environment, id, emit);
    agents.push(agent);
    bridge.emit('register');
  }

  hook.getEnvironments().forEach(connectAgent);
  hook.onEnvironment(connectAgent);

  bridge.onCall('relayDebugger:getEnvironments', () => {
    return Object.keys(agents);
  });

  bridge.onCall('relayDebugger:getRecord', (env, id) => {
    return agents[env].getRecord(id);
  });

  bridge.onCall('relayDebugger:getMatchingRecords', (env, search, type) => {
    return agents[env].getMatchingRecords(search, type);
  });

  bridge.onCall('relayDebugger:startRecording', env => {
    agents[env].startRecordingMutationEvents();
  });

  bridge.onCall('relayDebugger:stopRecording', env => {
    agents[env].stopRecordingMutationEvents();
  });

  bridge.onCall('relayDebugger:getRecordedEvents', env => {
    const events = agents[env].getRecordedMutationEvents();

    // serialize errors
    events.forEach(event => {
      if (event.payload instanceof Error) {
        event.payload = { isError: true, message: event.payload.message };
      }
    });

    return events;
  });

  bridge.onCall('hasDetectedRelay', () => {
    return agents.length !== 0;
  });
}
