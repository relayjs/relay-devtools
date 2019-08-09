// @flow

import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { SettingsModalContext } from './SettingsModalContext';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import TabBar from '../TabBar';
import { useLocalStorage, useModalDismissSignal } from '../hooks';
import ComponentsSettings from './ComponentsSettings';
import GeneralSettings from './GeneralSettings';

import styles from './SettingsModal.css';

type TabID = 'general' | 'components';

export default function SettingsModal(_: {||}) {
  const { isModalShowing } = useContext(SettingsModalContext);

  if (!isModalShowing) {
    return null;
  }

  return <SettingsModalImpl />;
}

function SettingsModalImpl(_: {||}) {
  const { setIsModalShowing } = useContext(SettingsModalContext);
  const dismissModal = useCallback(() => setIsModalShowing(false), [
    setIsModalShowing,
  ]);

  const [selectedTabID, selectTab] = useLocalStorage<TabID>(
    'React::DevTools::selectedSettingsTabID',
    'general'
  );

  const modalRef = useRef<HTMLDivElement | null>(null);
  useModalDismissSignal(modalRef, dismissModal);

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, [modalRef]);

  let view = null;
  switch (selectedTabID) {
    case 'general':
      view = <GeneralSettings />;
      break;
    case 'components':
      view = <ComponentsSettings />;
      break;
    default:
      break;
  }

  return (
    <div className={styles.Background}>
      <div className={styles.Modal} ref={modalRef}>
        <div className={styles.Tabs}>
          <TabBar
            currentTab={selectedTabID}
            id="Settings"
            selectTab={selectTab}
            size="small"
            tabs={tabs}
          />
          <div className={styles.Spacer} />
          <Button onClick={dismissModal} title="Close settings dialog">
            <ButtonIcon type="close" />
          </Button>
        </div>
        <div className={styles.Content}>{view}</div>
      </div>
    </div>
  );
}

const tabs = [
  {
    id: 'general',
    icon: 'settings',
    label: 'General',
  },
  {
    id: 'components',
    icon: 'components',
    label: 'Components',
  },
];
