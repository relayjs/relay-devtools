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

// import type {Environment} from 'relay-runtime';
import type {default as BridgeType} from '../transport/Bridge';

// import EnvironmentAgent from './EnvironmentAgent';
import {getGlobalHook} from './GlobalHook';

const hook = getGlobalHook(window);
// let bridge;

export default function connectBackend(bridge: BridgeType): void {
  console.log('connectBackend called');
  // bridge = _bridge;

  // const agents = new Map();
  // function connectAgent(environment: Environment, id): void {
  //   if (hook._agents.has(id)) {
  //     return;
  //   }
  //   try {
  //     function emit(name, data) {
  //       bridge.emit(name, {...data, environment: id});
  //     }
  //     // $FlowFixMe
  //     const agent = new EnvironmentAgent(environment, id, emit);
  //     hook._agents.set(id, agent);
  //     bridge.emit('register');
  //   } catch (error) {
  //     /* eslint-disable no-console */
  //     console.error('Relay DevTools: Failed to connect agent');
  //     console.error(error);
  //     /* eslint-enable no-console */
  //   }
  // }

  // $FlowFixMe
  hook._pending.forEach(({event, data}) => {
    bridge.emit(event, data);
  });

  // $FlowFixMe
  hook._pending.clear();

  // $FlowFixMe
  hook._agents.forEach(agent => {
    bridge.emit('register');

    agent.setEmitFunction(function emit(name, data) {
      bridge.emit(name, {...data, environment: agent.getId()});
    });
  });

  bridge.onCall('relayDebugger:getEnvironments', () => {
    // $FlowFixMe
    return Array.from(hook._agents.keys(), key => key.toString());
  });

  bridge.onCall('relayDebugger:getRecord', (env, id) => {
    // $FlowFixMe
    return hook._agents.get(Number(env)).getRecord(id);
  });

  bridge.onCall('relayDebugger:getMatchingRecords', (env, search, type) => {
    // $FlowFixMe
    return hook._agents.get(Number(env)).getMatchingRecords(search, type);
  });

  bridge.onCall('hasDetectedRelay', () => {
    // $FlowFixMe
    return hook._agents.size !== 0;
  });

  bridge.onCall('relayDebugger:getEnvironmentsDetails', () => {
    // $FlowFixMe
    return Array.from(hook._agents.values()).reduce((acc, currentValue) => {
      acc[currentValue._id] =
        currentValue._environment.configName ||
        `Environment ${Number(currentValue._id) + 1}`;
      return acc;
    }, {});
  });

  bridge.emit('ready');
}
