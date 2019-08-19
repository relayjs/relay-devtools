// @flow

export type EnvironmentID = number;

type Dispatcher = any;

export type RelayEnvironment = {
  version: string,

  // 16.9+
  overrideHookState?: ?(
    fiber: Object,
    id: number,
    path: Array<string | number>,
    value: any
  ) => void,

  // 16.7+
  overrideProps?: ?(
    fiber: Object,
    path: Array<string | number>,
    value: any
  ) => void,

  // 16.9+
  scheduleUpdate?: ?(fiber: Object) => void,
  setSuspenseHandler?: ?(shouldSuspend: (fiber: Object) => boolean) => void,

  // Only injected by React v16.8+ in order to support hooks inspection.
  currentDispatcherRef?: {| current: null | Dispatcher |},

  // <= 15
  Mount?: any,
};

export type EnvironmentWrapper = {
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
