// @flow

import type {
  DevToolsHook,
  RelayEnvironment,
  EnvironmentWrapper,
} from './types';

export function attach(
  hook: DevToolsHook,
  rendererID: number,
  environment: RelayEnvironment,
  global: Object
): EnvironmentWrapper {
  console.log('renderer.attach');
  function cleanup() {
    // We don't patch any methods so there is no cleanup.
  }

  return {
    cleanup,
  };
}
