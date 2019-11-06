// @flow

export type EnvironmentID = number;

export type RelayEnvironment = {
  execute: (options: any) => any,
};

export type EnvironmentWrapper = {
  flushInitialOperations: () => void,
  cleanup: () => void,
};

export type Handler = (data: any) => void;

export type DevToolsHook = {
  registerEnvironment: (env: RelayEnvironment) => number | null,
  // listeners: { [key: string]: Array<Handler> },
  environmentWrappers: Map<EnvironmentID, EnvironmentWrapper>,
  environments: Map<EnvironmentID, RelayEnvironment>,

  emit: (event: string, data: any) => void,
  on: (event: string, handler: Handler) => void,
  off: (event: string, handler: Handler) => void,
  // reactDevtoolsAgent?: ?Object,
  sub: (event: string, handler: Handler) => () => void,
};
