// @flow

export type Wall = {|
  // `listen` returns the "unlisten" function.
  listen: (fn: Function) => Function,
  send: (event: string, payload: any, transferable?: Array<any>) => void,
|};

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
