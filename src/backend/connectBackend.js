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
import type { Hook } from './installGlobalHook';

/**
 * connectBackend:
 *
 * Given a Hook and a Bridge, create Agents for every Relay Environment found,
 * and attach Bridge callbacks to Agent methods.
 */
export default function connectBackend(hook: Hook, bridge: Bridge): void {
  const agents = [];

  function connectAgent(environment: Environment): void {
    const id = agents.length;
    const agent = new EnvironmentAgent(environment, id);
    agents.push(agent);
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

  bridge.onCall('relayDebugger:checkDirty', env => {
    const envDebugger = agents[env];
    const isDirty = envDebugger.isDirty();
    envDebugger.resetDirty();
    return isDirty;
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

  bridge.onCall('relayDebugger:check', () => {
    return agents.length !== 0;
  });
}
