/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* global chrome */

import { createElement } from 'react';
import { unstable_createRoot as createRoot, flushSync } from 'react-dom';
import Bridge from 'src/bridge';
import Store from 'src/devtools/store';
import inject from './inject';
import { createViewElementSource, getBrowserTheme } from './utils';
import DevTools from 'src/devtools/views/DevTools';

let panelCreated = false;

function createPanelIfReactLoaded() {
  if (panelCreated) {
    return;
  }

  chrome.devtools.inspectedWindow.eval(
    'window.__RELAY_DEVTOOLS_HOOK__ && window.__RELAY_DEVTOOLS_HOOK__.environments.size > 0',
    (pageHasRelay, error) => {
      if (!pageHasRelay || panelCreated) {
        return;
      }

      panelCreated = true;

      clearInterval(loadCheckInterval);

      let bridge = null;
      let store = null;

      let cloneStyleTags = null;
      let render = null;
      let root = null;
      let currentPanel = null;

      const tabId = chrome.devtools.inspectedWindow.tabId;

      function initBridgeAndStore() {
        const port = chrome.runtime.connect({
          name: '' + tabId,
        });
        // Looks like `port.onDisconnect` does not trigger on in-tab navigation like new URL or back/forward navigation,
        // so it makes no sense to handle it here.

        bridge = new Bridge({
          listen(fn) {
            const listener = message => fn(message);
            // Store the reference so that we unsubscribe from the same object.
            const portOnMessage = port.onMessage;
            portOnMessage.addListener(listener);
            return () => {
              portOnMessage.removeListener(listener);
            };
          },
          send(event: string, payload: any, transferable?: Array<any>) {
            port.postMessage({ event, payload }, transferable);
          },
        });

        store = new Store(bridge);

        // Initialize the backend only once the Store has been initialized.
        // Otherwise the Store may miss important initial tree op codes.
        inject(chrome.runtime.getURL('build/backend.js'));

        const viewElementSourceFunction = createViewElementSource(
          bridge,
          store
        );

        render = () => {
          if (root) {
            root.render(
              createElement(DevTools, {
                bridge,
                browserTheme: getBrowserTheme(),
                showTabBar: true,
                store,
                viewElementSourceFunction,
                rootContainer: currentPanel.container,
              })
            );
          }
        };

        render();
      }

      cloneStyleTags = () => {
        const linkTags = [];
        for (let linkTag of document.getElementsByTagName('link')) {
          if (linkTag.rel === 'stylesheet') {
            const newLinkTag = document.createElement('link');
            for (let attribute of linkTag.attributes) {
              newLinkTag.setAttribute(attribute.nodeName, attribute.nodeValue);
            }
            linkTags.push(newLinkTag);
          }
        }
        return linkTags;
      };

      initBridgeAndStore();

      function ensureInitialHTMLIsCleared(container) {
        if (container._hasInitialHTMLBeenCleared) {
          return;
        }
        container.innerHTML = '';
        container._hasInitialHTMLBeenCleared = true;
      }

      chrome.devtools.panels.create('Relay', '', 'panel.html', panel => {
        panel.onShown.addListener(panel => {
          if (currentPanel === panel) {
            return;
          }
          currentPanel = panel;

          if (panel.container != null) {
            panel.injectStyles(cloneStyleTags);
            ensureInitialHTMLIsCleared(panel.container);
            root = createRoot(panel.container);
            render();
          }
        });
        panel.onHidden.addListener(() => {
          // TODO: Stop highlighting and stuff.
        });
      });

      chrome.devtools.network.onNavigated.removeListener(checkPageForReact);

      // Shutdown bridge before a new page is loaded.
      chrome.webNavigation.onBeforeNavigate.addListener(
        function onBeforeNavigate(details) {
          // Ignore navigation events from other tabs (or from within frames).
          if (details.tabId !== tabId || details.frameId !== 0) {
            return;
          }

          // `bridge.shutdown()` will remove all listeners we added, so we don't have to.
          bridge.shutdown();
        }
      );

      // Re-initialize DevTools panel when a new page is loaded.
      chrome.devtools.network.onNavigated.addListener(function onNavigated() {
        // It's easiest to recreate the DevTools panel (to clean up potential stale state).
        // We can revisit this in the future as a small optimization.
        flushSync(() => {
          root.unmount(() => {
            initBridgeAndStore();
          });
        });
      });
    }
  );
}

// Load (or reload) the DevTools extension when the user navigates to a new page.
function checkPageForReact() {
  createPanelIfReactLoaded();
}

chrome.devtools.network.onNavigated.addListener(checkPageForReact);

// Check to see if React has loaded once per second in case React is added
// after page load
const loadCheckInterval = setInterval(function() {
  createPanelIfReactLoaded();
}, 1000);

createPanelIfReactLoaded();
