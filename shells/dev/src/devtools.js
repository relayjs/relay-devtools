/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { createElement } from 'react';
// $FlowFixMe Flow does not yet know about createRoot()
import { unstable_createRoot as createRoot } from 'react-dom';
import Bridge from 'src/bridge';
import { installHook } from 'src/hook';
import { initDevTools } from 'src/devtools';
import Store from 'src/devtools/store';
import DevTools from 'src/devtools/views/DevTools';

const iframe = ((document.getElementById('target'): any): HTMLIFrameElement);

const { contentDocument, contentWindow } = iframe;

installHook(contentWindow);

const container = ((document.getElementById('devtools'): any): HTMLElement);

let isTestAppMounted = true;

const mountButton = ((document.getElementById(
  'mountButton'
): any): HTMLButtonElement);
mountButton.addEventListener('click', function() {
  if (isTestAppMounted) {
    if (typeof window.unmountTestApp === 'function') {
      window.unmountTestApp();
      mountButton.innerText = 'Mount test app';
      isTestAppMounted = false;
    }
  } else {
    if (typeof window.mountTestApp === 'function') {
      window.mountTestApp();
      mountButton.innerText = 'Unmount test app';
      isTestAppMounted = true;
    }
  }
});

inject('dist/app.js', () => {
  initDevTools({
    connect(cb) {
      const bridge = new Bridge<any, any>({
        listen(fn) {
          const listener = ({ data }: any) => {
            fn(data);
          };
          // Preserve the reference to the window we subscribe to, so we can unsubscribe from it when required.
          const contentWindowParent = contentWindow.parent;
          contentWindowParent.addEventListener('message', listener);
          return () => {
            contentWindowParent.removeEventListener('message', listener);
          };
        },
        sendAll(events) {
          contentWindow.postMessage(events, '*');
        },
      });

      cb(bridge);

      const store = new Store(bridge);

      const root = createRoot(container);
      const batch = root.createBatch();
      batch.render(
        (createElement: $FlowFixMe)(DevTools, {
          bridge,
          browserTheme: 'light',
          showTabBar: true,
          store,
        })
      );
      batch.then(() => {
        batch.commit();

        // Initialize the backend only once the DevTools frontend Store has been initialized.
        // Otherwise the Store may miss important initial tree op codes.
        inject('dist/backend.js');
      });
    },

    onReload(reloadFn) {
      iframe.onload = reloadFn;
    },
  });
});

function inject(sourcePath: string, callback: void | (() => void)) {
  const script = contentDocument.createElement('script');
  script.onload = callback;
  script.src = sourcePath;

  ((contentDocument.body: any): HTMLBodyElement).appendChild(script);
}
