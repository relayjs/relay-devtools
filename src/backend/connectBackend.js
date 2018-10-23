/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * connectBackend:
 *
 * Given a Hook and a Bridge, create Agents for every Relay Environment found,
 * and attach Bridge callbacks to Agent methods.
 */

'use strict';

import type {Environment} from 'relay-runtime';
import type {default as BridgeType} from '../transport/Bridge';

import EnvironmentAgent from './EnvironmentAgent';
import {getGlobalHook} from './GlobalHook';

export default function connectBackend(bridge: BridgeType): void {
  const agents = [];

  function connectAgent(environment: Environment): void {
    try {
      const id = agents.length;
      function emit(name, data) {
        bridge.emit(name, {...data, environment: id});
      }
      // $FlowFixMe
      const agent = new EnvironmentAgent(environment, id, emit);
      agents.push(agent);
      bridge.emit('register');
    } catch (error) {
      /* eslint-disable no-console */
      console.error('Relay DevTools: Failed to connect agent');
      console.error(error);
      /* eslint-enable no-console */
    }
  }
  const hook = getGlobalHook(window);
  // $FlowFixMe
  hook.getEnvironments().forEach(connectAgent);
  // $FlowFixMe
  hook.onEnvironment(connectAgent);
  bridge.onCall('relayDebugger:getEnvironments', () => {
    // $FlowFixMe
    return Object.keys(agents);
  });

  bridge.onCall('relayDebugger:getRecord', (env, id) => {
    // $FlowFixMe
    return agents[env].getRecord(id);
  });

  bridge.onCall('relayDebugger:getMatchingRecords', (env, search, type) => {
    // $FlowFixMe
    return agents[env].getMatchingRecords(search, type);
  });

  bridge.onCall('hasDetectedRelay', () => {
    return agents.length !== 0;
  });

  bridge.onCall('relayDebugger:getEnvironmentsDetails', () => {
    return JSON.stringify(agents);
  });

  bridge.emit('ready');
}
