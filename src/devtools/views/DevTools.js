// @flow

// Reach styles need to come before any component styles.
// This makes overridding the styles simpler.
import '@reach/menu-button/styles.css';
import '@reach/tooltip/styles.css';

import React, { useState } from 'react';
import Bridge from 'src/bridge';
import Store from '../store';
import { BridgeContext, StoreContext } from './context';
import Network from './Network/Network';
import StoreInspector from './StoreInspector/StoreInspector';
import TabBar from './TabBar';
import { SettingsContextController } from './Settings/SettingsContext';
import { ModalDialogContextController } from './ModalDialog';
import RelayLogo from './RelayLogo';

import styles from './DevTools.css';

import './root.css';

export type BrowserTheme = 'dark' | 'light';
export type TabID = 'network' | 'settings' | 'store-inspector';
export type ViewElementSource = (id: number) => void;

export type Props = {|
  bridge: Bridge,
  browserTheme?: BrowserTheme,
  defaultTab?: TabID,
  showTabBar?: boolean,
  store: Store,
  viewElementSourceFunction?: ?ViewElementSource,
  viewElementSourceRequiresFileLocation?: boolean,

  // This property is used only by the web extension target.
  // The built-in tab UI is hidden in that case, in favor of the browser's own panel tabs.
  // This is done to save space within the app.
  // Because of this, the extension needs to be able to change which tab is active/rendered.
  overrideTab?: TabID,

  // To avoid potential multi-root trickiness, the web extension uses portals to render tabs.
  // The root <DevTools> app is rendered in the top-level extension window,
  // but individual tabs (e.g. Components, Profiling) can be rendered into portals within their browser panels.
  networkPortalContainer?: Element,
  settingsPortalContainer?: Element,
  storeInspectorPortalContainer?: Element,
|};

const networkTab = {
  id: ('network': TabID),
  icon: 'network',
  label: 'Network',
  title: 'Relay Network',
};
const storeInspectorTab = {
  id: ('store-inspector': TabID),
  icon: 'store-inspector',
  label: 'Store',
  title: 'Relay Store',
};

const tabs = [networkTab, storeInspectorTab];

export default function DevTools({
  bridge,
  browserTheme = 'light',
  defaultTab = 'network',
  networkPortalContainer,
  storeInspectorPortalContainer,
  overrideTab,
  settingsPortalContainer,
  showTabBar = false,
  store,
  viewElementSourceFunction,
  viewElementSourceRequiresFileLocation = false,
}: Props) {
  const [tab, setTab] = useState(defaultTab);
  if (overrideTab != null && overrideTab !== tab) {
    setTab(overrideTab);
  }

  return (
    <BridgeContext.Provider value={bridge}>
      <StoreContext.Provider value={store}>
        <ModalDialogContextController>
          <SettingsContextController
            browserTheme={browserTheme}
            settingsPortalContainer={settingsPortalContainer}
          >
            <div className={styles.DevTools}>
              {showTabBar && (
                <div className={styles.TabBar}>
                  <RelayLogo />
                  <span className={styles.DevToolsVersion}>
                    {process.env.DEVTOOLS_VERSION}
                  </span>
                  <div className={styles.Spacer} />
                  <TabBar
                    currentTab={tab}
                    id="DevTools"
                    selectTab={setTab}
                    size="large"
                    tabs={tabs}
                  />
                </div>
              )}
              <div className={styles.TabContent} hidden={tab !== 'network'}>
                <Network portalContainer={networkPortalContainer} />
              </div>
              <div
                className={styles.TabContent}
                hidden={tab !== 'store-inspector'}
              >
                <StoreInspector
                  portalContainer={storeInspectorPortalContainer}
                />
              </div>
            </div>
          </SettingsContextController>
        </ModalDialogContextController>
      </StoreContext.Provider>
    </BridgeContext.Provider>
  );
}
