/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BridgeContext, StoreContext } from '../context';
import Button from '../Button';
import RecordList from './RecordList';
import ButtonIcon from '../ButtonIcon';
import { copy } from 'clipboard-js';
import { serializeDataForCopy } from '../utils';
import TabBar from './StoreTabBar';
import RecordingImportExportButtons from './RecordingImportExportButtons';
import RecordDetails from './RecordDetails';
import Snapshots from './Snapshot';
import Optimistic from './OptimisticUpdates';
import { deepCopyFunction } from './utils';
import EventLogger from './EventLogger/EventLogger';
import { logEvent } from '../../../Logger';
import styles from './StoreInspector.css';
import type { ReactSetStateFunction } from "react";

export type TabID =
  | 'explorer'
  | 'snapshot'
  | 'optimistic'
  | 'recorder'
  | 'invalidRecords'
  | 'updatedRecords';
export type TabInfo = {|
  id: string,
  label: string,
  title?: string,
|};

const snapshotTab = {
  id: ('snapshot': TabID),
  label: 'Snapshot',
  title: 'Relay Snapshot',
};
const explorerTab = {
  id: ('explorer': TabID),
  label: 'Store Explorer',
  title: 'Relay Store Explorer',
};
const optimisticTab = {
  id: ('optimistic': TabID),
  label: 'Optimistic Updates',
  title: 'Relay Optimistic Updates',
};
const recorderTab = {
  id: ('recorder': TabID),
  label: 'Event Logger',
  title: 'Relay Store Event Logger',
};

const tabs = [explorerTab, snapshotTab, optimisticTab, recorderTab];

function FilterButtons({ checked, setChecked, isRecording, store }: {|
  checked: any | {| networkEvents: boolean, storeEvents: boolean |},
  isRecording: any | boolean,
  setChecked:
    | any
    | ReactSetStateFunction<
      any | {| networkEvents: boolean, storeEvents: boolean |},
    >,
  store: any,
|}) {
  const updateChecked = useCallback(
    (e: any) => {
      setChecked({
        ...checked,
        [e.target.name]: !checked[e.target.name],
      });
    },
    [checked, setChecked]
  );

  return (
    <form className={styles.FilterButtons}>
      <label>
        <input
          type="checkbox"
          name="networkEvents"
          checked={checked['networkEvents']}
          onChange={updateChecked}
          disabled={isRecording}
        />
        Network Events
      </label>
      <label>
        <input
          type="checkbox"
          name="storeEvents"
          checked={checked['storeEvents']}
          onChange={updateChecked}
          disabled={isRecording}
        />
        Store Events
      </label>
    </form>
  );
}

function RecordEventsMenu({
  isRecording,
  startRecording,
  stopRecording,
  stopAndClearRecording,
  store,
  checked,
  setChecked,
}: {|
  checked: any | {| networkEvents: boolean, storeEvents: boolean |},
  isRecording: boolean,
  setChecked: ReactSetStateFunction<
    any | {| networkEvents: boolean, storeEvents: boolean |},
  >,
  startRecording: () => void,
  stopAndClearRecording: () => void,
  stopRecording: () => void,
  store: any,
|}) {
  const [importing, setImporting] = useState(false);
  const className = isRecording
    ? styles.ActiveRecordToggle
    : styles.InactiveRecordToggle;

  const clickRecord = useCallback(() => {
    isRecording ? stopRecording() : startRecording();
    setImporting(false);
    store.setImportEnvID(null);
  }, [isRecording, store, stopRecording, startRecording]);

  const clickClear = useCallback(() => {
    stopAndClearRecording();
    setImporting(false);
    store.setImportEnvID(null);
  }, [store, stopAndClearRecording, setImporting]);

  return (
    <div className={styles.RecordEventsMenu}>
      <Button
        onClick={clickRecord}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        className={className}
      >
        <ButtonIcon type="record" />
      </Button>
      <Button onClick={clickClear} title="Stop and Clear Recording">
        <ButtonIcon type="clear" />
      </Button>
      <RecordingImportExportButtons
        isRecording={isRecording}
        store={store}
        importing={importing}
        setImporting={setImporting}
      />
      <FilterButtons
        checked={checked}
        setChecked={setChecked}
        isRecording={isRecording}
        store={store}
      />
    </div>
  );
}

export default function StoreInspector(props: {|
  +portalContainer: mixed,
  currentEnvID: ?number,
|}): null | React$MixedElement {
  const store = useContext(StoreContext);
  const bridge = useContext(BridgeContext);
  const [tab, setTab] = useState(explorerTab);
  const selectTab = useCallback(
    (tabInfo: $FlowFixMe) => {
      logEvent({ event_name: 'selected-store-tab', extra: tabInfo.id });
      setTab(tabInfo);
    },
    [setTab]
  );
  const [, forceUpdate] = useState({});
  const [envSnapshotList, setEnvSnapshotList] = useState<{[$FlowFixMe]: any}>({});
  const [envSnapshotListByType, setEnvSnapshotListByType] = useState<{[$FlowFixMe]: any}>({});
  const [isRecording, setIsRecording] = useState(false);
  const [checked, setChecked] = useState({
    networkEvents: true,
    storeEvents: true,
  });
  const stopAndClearRecording = useCallback(() => {
    setIsRecording(false);
    store.stopRecording();
    store.clearAllEvents();
  }, [store, setIsRecording]);
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    store.stopRecording();
  }, [store, setIsRecording]);
  const startRecording = useCallback(() => {
    setIsRecording(true);
    store.startRecording();
  }, [store, setIsRecording]);

  useEffect(() => {
    const refreshEvents = () => {
      forceUpdate({});
    };
    store.addListener('storeDataReceived', refreshEvents);
    store.addListener('allEventsReceived', refreshEvents);
    return () => {
      store.removeListener('storeDataReceived', refreshEvents);
      store.removeListener('allEventsReceived', refreshEvents);
    };
  }, [store]);

  const [selectedRecordID, setSelectedRecordID] = useState('');
  let records = {};
  const recordsByType = new Map<mixed, Array<string>>();

  const refreshStore = useCallback(() => {
    const currEnvID = props.currentEnvID;
    if (currEnvID != null) {
      const recordsArr = envSnapshotList[currEnvID] || [];
      recordsArr.push(deepCopyFunction(records));
      const recordsTypeArr = envSnapshotListByType[currEnvID] || [];
      recordsTypeArr.push(deepCopyFunction(recordsByType));
      setEnvSnapshotList({ ...envSnapshotList, [(currEnvID: $FlowFixMe)]: recordsArr });
      setEnvSnapshotListByType({
        ...envSnapshotListByType,
        [(currEnvID: $FlowFixMe)]: recordsTypeArr,
      });
      bridge.send('refreshStore', currEnvID);
    }
  }, [
    props,
    bridge,
    records,
    recordsByType,
    envSnapshotList,
    envSnapshotListByType,
  ]);

  const copyToClipboard = useCallback(() => {
    copy(serializeDataForCopy(records));
  }, [records]);

  const currentEnvID = props.currentEnvID;

  if (currentEnvID == null) {
    return null;
  }

  const recordingImportEnvironmentID = store.getImportEnvID();

  const allEvents = recordingImportEnvironmentID
    ? store.getEvents(recordingImportEnvironmentID)
    : store.getEvents(currentEnvID);

  records = store.getRecords(currentEnvID);
  const optimisticUpdates = store.getOptimisticUpdates(currentEnvID);
  let selectedRecord = {};
  if (records != null) {
    for (const key in records) {
      const rec = records[key];
      if (rec != null) {
        const arr = recordsByType.get(rec.__typename);
        if (arr) {
          arr.push(key);
        } else {
          recordsByType.set(rec.__typename, [key]);
        }
      }
    }
    selectedRecord = records[selectedRecordID];
  }

  if (records == null) {
    return null;
  }
  return (
    <div className={styles.StoreInspector}>
      <div className={styles.Toolbar}>
        <button
          className={styles.RefreshButton}
          onClick={refreshStore}
          title="Take Store Snapshot"
        >
          Take Store Snapshot
        </button>
        <Button onClick={copyToClipboard} title="Copy to clipboard">
          <ButtonIcon type="copy" />
        </Button>
        <div className={styles.Spacer} />
        <div className={styles.Spacer} />
        <TabBar
          tabID={tab.id}
          id="StoreTab"
          selectTab={selectTab}
          size="small"
          tabs={tabs}
        />
      </div>
      <div className={styles.Content}>
        {tab === explorerTab && (
          <div className={styles.TabContent}>
            <RecordList
              records={records}
              recordsByType={recordsByType}
              selectedRecordID={selectedRecordID}
              setSelectedRecordID={setSelectedRecordID}
            />
            <RecordDetails
              records={records}
              setSelectedRecordID={setSelectedRecordID}
              selectedRecord={selectedRecord}
            />
          </div>
        )}
        {tab === snapshotTab && (
          <div className={styles.TabContent}>
            <Snapshots
              envSnapshotList={envSnapshotList}
              envSnapshotListByType={envSnapshotListByType}
              currentEnvID={props.currentEnvID}
            />
          </div>
        )}
        {tab === optimisticTab && (
          <div className={styles.TabContent}>
            <Optimistic optimisticUpdates={optimisticUpdates} />
          </div>
        )}
        {tab === recorderTab && (
          <div className={styles.RecordEvents}>
            <RecordEventsMenu
              isRecording={isRecording}
              stopRecording={stopRecording}
              startRecording={startRecording}
              stopAndClearRecording={stopAndClearRecording}
              store={store}
              checked={checked}
              setChecked={setChecked}
            />
            <EventLogger
              allEvents={allEvents}
              isRecording={isRecording}
              checked={checked}
            />
          </div>
        )}
      </div>
    </div>
  );
}
