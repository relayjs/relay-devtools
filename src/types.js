/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type Wall = {|
  // `listen` returns the "unlisten" function.
  listen: (fn: Function) => Function,
  send: (event: string, payload: any, transferable?: Array<any>) => void,
|};

export type Record = { [key: string]: mixed, ... };
export type DataID = string;

export type StoreRecords = { [DataID]: ?Record, ... };

// Copied from relay
export type LogEvent =
  | {|
      +name: 'queryresource.fetch',
      +operation: $FlowFixMe,
      // FetchPolicy from relay-experimental
      +fetchPolicy: string,
      // RenderPolicy from relay-experimental
      +renderPolicy: string,
      +hasFullQuery: boolean,
      +shouldFetch: boolean,
    |}
  | {|
      +name: 'store.publish',
      +source: any,
      +optimistic: boolean,
    |}
  | {|
      +name: 'store.restore',
    |}
  | {|
      +name: 'execute.info',
      +transactionID: number,
      +info: mixed,
    |}
  | {|
      +name: 'execute.start',
      +transactionID: number,
      +params: $FlowFixMe,
      +variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.next',
      +transactionID: number,
      +response: $FlowFixMe,
    |}
  | {|
      +name: 'execute.error',
      +transactionID: number,
      +error: Error,
    |}
  | {|
      +name: 'execute.complete',
      +transactionID: number,
    |}
  | {|
      +name: 'execute.unsubscribe',
      +transactionID: number,
    |};

export type EventData = {|
  +id: number,
  +data: LogEvent,
  +source: StoreRecords,
  +eventType: string,
|};

export type StoreData = {|
  +name: string,
  +id: number,
  +records: StoreRecords,
|};

export type EnvironmentInfo = {|
  +id: number,
  +environmentName: string,
|};
