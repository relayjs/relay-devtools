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

import styles from './StoreInspector.css';

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

function RecordEventsMenu({
  isRecording,
  startRecording,
  stopRecording,
  stopAndClearRecording,
  store,
}) {
  let className = isRecording
    ? styles.ActiveRecordToggle
    : styles.InactiveRecordToggle;

  return (
    <div className={styles.RecordEventsMenu}>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        className={className}
      >
        <ButtonIcon type="record" />
      </Button>
      <Button onClick={stopAndClearRecording} title="Stop and Clear Recording">
        <ButtonIcon type="clear" />
      </Button>
      <RecordingImportExportButtons isRecording={isRecording} store={store} />
    </div>
  );
}

export default function StoreInspector(props: {|
  +portalContainer: mixed,
  currentEnvID: ?number,
|}) {
  const store = useContext(StoreContext);
  const bridge = useContext(BridgeContext);
  const [tab, setTab] = useState(explorerTab);
  const [, forceUpdate] = useState({});
  const [envSnapshotList, setEnvSnapshotList] = useState({});
  const [envSnapshotListByType, setEnvSnapshotListByType] = useState({});
  const [isRecording, setIsRecording] = useState(false);
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
  let recordsByType = new Map();

  const refreshStore = useCallback(() => {
    let currEnvID = props.currentEnvID;
    if (currEnvID != null) {
      let recordsArr = envSnapshotList[currEnvID] || [];
      recordsArr.push(deepCopyFunction(records));
      let recordsTypeArr = envSnapshotListByType[currEnvID] || [];
      recordsTypeArr.push(deepCopyFunction(recordsByType));
      setEnvSnapshotList({ ...envSnapshotList, [currEnvID]: recordsArr });
      setEnvSnapshotListByType({
        ...envSnapshotListByType,
        [currEnvID]: recordsTypeArr,
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

  let allEvents = store.getEvents(currentEnvID);

  records = store.getRecords(currentEnvID);
  let optimisticUpdates = store.getOptimisticUpdates(currentEnvID);
  let selectedRecord = {};
  if (records != null) {
    for (let key in records) {
      let rec = records[key];
      if (rec != null) {
        let arr = recordsByType.get(rec.__typename);
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
          title="Refresh"
        >
          Take Snapshot
        </button>
        <Button onClick={copyToClipboard} title="Copy to clipboard">
          <ButtonIcon type="copy" />
        </Button>
        <div className={styles.Spacer} />
      </div>
      <div className={styles.TabBar}>
        <div className={styles.Spacer} />
        <TabBar
          tabID={tab.id}
          id="StoreTab"
          selectTab={setTab}
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
            />
            <EventLogger allEvents={allEvents} isRecording={isRecording} />
          </div>
        )}
      </div>
    </div>
  );
}
