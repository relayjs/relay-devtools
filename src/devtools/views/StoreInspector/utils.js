/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type Store from '../../store';
import type { LogEvent } from '../../../types';

export function deepCopyFunction(inObject: any) {
  if (typeof inObject !== 'object' || inObject === null) {
    return inObject;
  }

  if (Array.isArray(inObject)) {
    const outObject = [];
    for (let i = 0; i < inObject.length; i++) {
      const value = inObject[i];
      outObject[i] = deepCopyFunction(value);
    }
    return outObject;
  } else if (inObject instanceof Map) {
    const outObject = new Map<mixed, mixed>();
    inObject.forEach((val, key) => {
      outObject.set(key, deepCopyFunction(val));
    });
    return outObject;
  } else {
    const outObject = {};
    for (const key in inObject) {
      const value = inObject[key];
      if (typeof key === 'string' && key != null) {
        outObject[key] = deepCopyFunction(value);
      }
    }
    return outObject;
  }
}

export function serializeEventLoggerRecording(store: Store) {
  const allEvents = Array.from(store.getAllEventsMap().entries());
  return (allEvents.map(entry => {
    const envID = entry[0];
    const data = entry[1];
    const envName = store.getEnvironmentName(envID) || '';
    const environment = envID + ' ' + envName;
    return [environment, data];
  }): Array<[string, mixed]>);
}

export function deserializeEventLoggerRecording(raw: string, store: Store) {
  const parsedDataRecording = ((new Map(JSON.parse(raw)): any): Map<
    string,
    Array<LogEvent>
  >);
  const envNames = {};
  const envIDs = (Array.from(parsedDataRecording.keys()).map(key => {
    const environment = String(key).split(' ');
    // Taking out the id from the environment string
    const id = parseInt(environment.shift());
    // We are left with the environment name
    const name = environment.join(' ');
    envNames[id] = name;
    const events = parsedDataRecording.get(String(key)) || [];
    store.setAllEventsMap(id, events);
    return id;
  }): Array<number>);
  store.setImportEnvID(envIDs[0]);
  return envIDs;
}
