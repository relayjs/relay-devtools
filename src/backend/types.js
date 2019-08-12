// @flow

type BundleType =
  | 0 // PROD
  | 1; // DEV

export type WorkTag = number;
export type SideEffectTag = number;
export type ExpirationTime = number;
export type RefObject = {|
  current: any,
|};
export type Source = {|
  fileName: string,
  lineNumber: number,
|};
export type HookType =
  | 'useState'
  | 'useReducer'
  | 'useContext'
  | 'useRef'
  | 'useEffect'
  | 'useLayoutEffect'
  | 'useCallback'
  | 'useMemo'
  | 'useImperativeHandle'
  | 'useDebugValue';

// The Fiber type is copied from React and should be kept in sync:
// https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js
// The properties we don't use in DevTools are omitted.
export type Fiber = {|
  tag: WorkTag,

  key: null | string,

  elementType: any,

  type: any,

  stateNode: any,

  return: Fiber | null,

  child: Fiber | null,
  sibling: Fiber | null,
  index: number,

  ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

  pendingProps: any, // This type will be more specific once we overload the tag.
  memoizedProps: any, // The props used to create the output.

  memoizedState: any,

  effectTag: SideEffectTag,

  alternate: Fiber | null,

  actualDuration?: number,

  actualStartTime?: number,

  treeBaseDuration?: number,

  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
|};

export type NativeType = Object;
export type RendererID = number;

type Dispatcher = any;

export type GetFiberIDForNative = (
  component: NativeType,
  findNearestUnfilteredAncestor?: boolean
) => number | null;
export type FindNativeNodesForFiberID = (id: number) => ?Array<NativeType>;

export type ReactRenderer = {
  findFiberByHostInstance: (hostInstance: NativeType) => ?Fiber,
  version: string,
  bundleType: BundleType,

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

export type ChangeDescription = {|
  context: Array<string> | boolean | null,
  didHooksChange: boolean,
  isFirstMount: boolean,
  props: Array<string> | null,
  state: Array<string> | null,
|};

export type CommitDataBackend = {|
  // Tuple of fiber ID and change description
  changeDescriptions: Array<[number, ChangeDescription]> | null,
  duration: number,
  // Tuple of fiber ID and actual duration
  fiberActualDurations: Array<[number, number]>,
  // Tuple of fiber ID and computed "self" duration
  fiberSelfDurations: Array<[number, number]>,
  interactionIDs: Array<number>,
  priorityLevel: string | null,
  timestamp: number,
|};

export type PathFrame = {|
  key: string | null,
  index: number,
  displayName: string | null,
|};

export type PathMatch = {|
  id: number,
  isFullMatch: boolean,
|};

export type InspectedElement = {|
  id: number,

  displayName: string | null,

  // Does the current renderer support editable hooks?
  canEditHooks: boolean,

  // Does the current renderer support editable function props?
  canEditFunctionProps: boolean,

  // Is this Suspense, and can its value be overriden now?
  canToggleSuspense: boolean,

  // Can view component source location.
  canViewSource: boolean,

  // Inspectable properties.
  context: Object | null,
  events: Object | null,
  hooks: Object | null,
  props: Object | null,
  state: Object | null,

  // Location of component in source coude.
  source: Source | null,
|};

export const InspectElementFullDataType = 'full-data';
export const InspectElementNoChangeType = 'no-change';
export const InspectElementNotFoundType = 'not-found';
export const InspectElementHydratedPathType = 'hydrated-path';

type InspectElementFullData = {|
  id: number,
  type: 'full-data',
  value: InspectedElement,
|};

type InspectElementHydratedPath = {|
  id: number,
  type: 'hydrated-path',
  path: Array<string | number>,
  value: any,
|};

type InspectElementNoChange = {|
  id: number,
  type: 'no-change',
|};

type InspectElementNotFound = {|
  id: number,
  type: 'not-found',
|};

export type InspectedElementPayload =
  | InspectElementFullData
  | InspectElementHydratedPath
  | InspectElementNoChange
  | InspectElementNotFound;

export type InstanceAndStyle = {|
  instance: Object | null,
  style: Object | null,
|};

export type RendererInterface = {
  cleanup: () => void,
};

export type Handler = (data: any) => void;

export type DevToolsHook = {
  listeners: { [key: string]: Array<Handler> },
  rendererInterfaces: Map<RendererID, RendererInterface>,
  renderers: Map<RendererID, ReactRenderer>,

  emit: (event: string, data: any) => void,
  inject: (renderer: ReactRenderer) => number | null,
  on: (event: string, handler: Handler) => void,
  off: (event: string, handler: Handler) => void,
  reactDevtoolsAgent?: ?Object,
  sub: (event: string, handler: Handler) => () => void,
};

export type HooksNode = {
  id: number,
  isStateEditable: boolean,
  name: string,
  value: mixed,
  subHooks: Array<HooksNode>,
};
export type HooksTree = Array<HooksNode>;
