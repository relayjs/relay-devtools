// @flow

import type {
  DevToolsHook,
  RelayEnvironment,
  EnvironmentWrapper,
} from './types';
import type Agent from './agent';

import { attach } from './EnvironmentWrapper';

export function initBackend(
  hook: DevToolsHook,
  agent: Agent,
  global: Object
): () => void {
  console.log('init backend', { hook, agent });
  const subs = [
    hook.sub(
      'environment-attached',
      ({
        id,
        environment,
        environmentWrapper,
      }: {
        id: number,
        environment: RelayEnvironment,
        environmentWrapper: EnvironmentWrapper,
      }) => {
        // agent.setEnvironmentWrapper(id, environmentWrapper);
        // Now that the Store and the renderer interface are connected,
        // it's time to flush the pending operation codes to the frontend.
        environmentWrapper.flushInitialOperations();
      }
    ),
    hook.sub('Environment.execute', data => {
      agent.onEnvironmentExecute(data);
    }),
  ];

  const attachEnvironment = (id: number, environment: RelayEnvironment) => {
    let environmentWrapper = hook.environmentWrappers.get(id);

    // Inject any not-yet-injected renderers (if we didn't reload-and-profile)
    if (!environmentWrapper) {
      environmentWrapper = attach(hook, id, environment, global);
      hook.environmentWrappers.set(id, environmentWrapper);
    }

    // Notify the DevTools frontend about new renderers.
    hook.emit('environment-attached', {
      id,
      environment,
      environmentWrapper,
    });
  };

  // Connect renderers that have already injected themselves.
  hook.environments.forEach((environment, id) => {
    attachEnvironment(id, environment);
  });

  // Connect any new renderers that injected themselves.
  subs.push(
    hook.sub(
      'environment',
      ({ id, environment }: { id: number, environment: RelayEnvironment }) => {
        attachEnvironment(id, environment);
      }
    )
  );

  return () => {
    subs.forEach(fn => fn());
  };
}
