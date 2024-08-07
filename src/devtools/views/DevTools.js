/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Reach styles need to come before any component styles.
// This makes overridding the styles simpler.
import '@reach/menu-button/styles.css';
import '@reach/tooltip/styles.css';

import React, { useState, useCallback, useEffect } from 'react';
import type { FrontendBridge } from 'src/bridge';
import Store from '../store';
import { BridgeContext, StoreContext } from './context';
import Network from './Network/Network';
import StoreInspector from './StoreInspector/StoreInspector';
import TabBar from './TabBar';
import { SettingsContextController } from './Settings/SettingsContext';
import { ModalDialogContextController } from './ModalDialog';
import RelayLogo from './RelayLogo';
import tooltipStyles from './Tooltip.css';
import Tooltip from '@reach/tooltip';
import Icon from './Icon';
import { logEvent } from '../../Logger';
import styles from './DevTools.css';

import './root.css';

export type BrowserTheme = 'dark' | 'light';
export type TabID = 'network' | 'settings' | 'store-inspector';
export type ViewElementSource = (id: number) => void;

export type Props = {|
  bridge: FrontendBridge,
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

  // TODO: Cleanup multi-tabs in webextensions
  // To avoid potential multi-root trickiness, the web extension uses portals to render tabs.
  // The root <DevTools> app is rendered in the top-level extension window,
  // but individual tabs (e.g. Components, Profiling) can be rendered into portals within their browser panels.
  rootContainer?: Element,
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
  defaultTab = 'store-inspector',
  rootContainer,
  networkPortalContainer,
  storeInspectorPortalContainer,
  overrideTab,
  settingsPortalContainer,
  showTabBar = false,
  store,
  viewElementSourceFunction,
  viewElementSourceRequiresFileLocation = false,
}: Props): React$MixedElement {
  const [tab, setTab] = useState(defaultTab);
  const selectTab = useCallback(
    (tabId: TabID) => {
      logEvent({ event_name: 'selected-tab', extra: tabId });
      setTab(tabId);
    },
    [setTab]
  );

  if (overrideTab != null && overrideTab !== tab) {
    selectTab(overrideTab);
  }

  const [environmentIDs, setEnvironmentIDs] = useState(
    store.getEnvironmentIDs()
  );
  const [currentEnvID, setCurrentEnvID] = useState(environmentIDs[0]);

  const setEnv = useCallback(() => {
    const ids = store.getEnvironmentIDs();
    if (currentEnvID === undefined) {
      const firstKey = ids[0];
      setCurrentEnvID(firstKey);
    }
    setEnvironmentIDs(ids);
  }, [store, currentEnvID]);

  useEffect(() => {
    store.addListener('environmentInitialized', setEnv);
    return () => {
      store.removeListener('environmentInitialized', setEnv);
    };
  }, [store, setEnv]);

  useEffect(() => {
    logEvent({ event_name: 'loaded-dev-tools' });
  }, []);

  const environmentChange = useCallback((e: any) => {
    setCurrentEnvID(parseInt(e.target.value));
  }, []);

  return (
    <BridgeContext.Provider value={bridge}>
      <StoreContext.Provider value={store}>
        <ModalDialogContextController>
          <SettingsContextController
            browserTheme={browserTheme}
            rootContainer={rootContainer}
            networkPortalContainer={networkPortalContainer}
            settingsPortalContainer={settingsPortalContainer}
          >
            <div className={styles.DevTools}>
              {showTabBar && (
                <div className={styles.TabBar}>
                  <RelayLogo />
                  <span className={styles.DevToolsVersion}>
                    {process.env.DEVTOOLS_VERSION}
                  </span>
                  <select
                    className={styles.environmentDropDown}
                    onChange={environmentChange}
                  >
                    {environmentIDs.map(key => {
                      return (
                        <option key={key} value={key}>
                          {key}: {store.getEnvironmentName(key)}
                        </option>
                      );
                    })}
                  </select>
                  <div className={styles.Spacer} />
                  <TabBar
                    currentTab={tab}
                    id="DevTools"
                    selectTab={selectTab}
                    size="large"
                    tabs={tabs}
                  />
                  <div className={styles.FeedbackLinks}>
                    <Tooltip
                      className={tooltipStyles.Tooltip}
                      label="FB Internal Feedback Group"
                    >
                      <a
                        href={process.env.DEVTOOLS_FEEDBACK_GROUP}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon
                          className={styles.IconSizeLarge}
                          type="fb-feedback"
                        />
                      </a>
                    </Tooltip>
                    <Tooltip
                      className={tooltipStyles.Tooltip}
                      label="Github Issues"
                    >
                      <a
                        href={process.env.GITHUB_ISSUES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon
                          className={styles.IconSizeLarge}
                          type="github-feedback"
                        />
                      </a>
                    </Tooltip>
                  </div>
                </div>
              )}
              <div className={styles.TabContent} hidden={tab !== 'network'}>
                <Network
                  portalContainer={networkPortalContainer}
                  currentEnvID={currentEnvID}
                />
              </div>
              <div
                className={styles.TabContent}
                hidden={tab !== 'store-inspector'}
              >
                <StoreInspector
                  portalContainer={storeInspectorPortalContainer}
                  currentEnvID={currentEnvID}
                />
              </div>
            </div>
          </SettingsContextController>
        </ModalDialogContextController>
      </StoreContext.Provider>
    </BridgeContext.Provider>
  );
}
