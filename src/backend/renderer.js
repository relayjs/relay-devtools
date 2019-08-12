// @flow

import type { DevToolsHook, ReactRenderer, RendererInterface } from './types';

export function attach(
  hook: DevToolsHook,
  rendererID: number,
  renderer: ReactRenderer,
  global: Object
): RendererInterface {
  function cleanup() {
    // We don't patch any methods so there is no cleanup.
  }

  return {
    cleanup,
  };
}
