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
import InspectedElementTree from '../Components/InspectedElementTree';

import styles from './StoreInspector.css';

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
  );
}

function RecordList({ records, selectedRecordID, setSelectedRecordID }) {
  const [recordSearch, setRecordSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setRecordSearch(e.target.value);
  }, []);

  if (records == null) {
    return <div>Loading...</div>;
  }
  const recordRows = Object.keys(records)
    .filter(recordID =>
      recordSearch
        .trim()
        .split(' ')
        .some(search => recordID.toLowerCase().includes(search.toLowerCase()))
    )
    .map(recordID => {
      return (
        <div
          key={recordID}
          onClick={() => {
            setSelectedRecordID(recordID);
          }}
          className={`${styles.Record} ${
            recordID === selectedRecordID ? styles.SelectedRecord : ''
          }`}
        >
          {recordID}
        </div>
      );
    });

  return (
    <div className={styles.Records}>
      <input
        className={styles.RecordsSearchBar}
        type="text"
        onChange={fetchSearchBarText}
        placeholder="Search"
      ></input>
      {recordRows.length <= 0 && recordSearch !== '' ? (
        <p className={styles.RecordNotFound}>
          Sorry, no records with the name '{recordSearch}' were found!
        </p>
      ) : (
        recordRows
      )}
    </div>
  );
}

function RecordDetails(props: {| selectedRecord: Object |}) {
  if (props.selectedRecord == null) {
    return <div className={styles.RecordDetails}>No record selected</div>;
  }

  const { __id, __typename, ...data } = props.selectedRecord;

  return (
    <div className={styles.RecordDetails}>
      <Section title="ID">{__id}</Section>
      <Section title="Type">{__typename}</Section>
      <InspectedElementTree label="Store data" data={data} showWhenEmpty />
    </div>
  );
}

export default function StoreInspector(props: {|
  +portalContainer: mixed,
  currentEnvID: ?number,
|}) {
  const store = useContext(StoreContext);
  const bridge = useContext(BridgeContext);
  const [, forceUpdate] = useState({});
  const refreshStore = useCallback(() => {
    bridge.send('refreshStore', props.currentEnvID);
  }, [props, bridge]);

  useEffect(() => {
    const onStoreData = () => {
      forceUpdate({});
    };
    store.addListener('storeDataReceived', onStoreData);
    return () => {
      store.removeListener('storeDataReceived', onStoreData);
    };
  }, [store]);

  const [selectedRecordID, setSelectedRecordID] = useState(0);

  if (props.currentEnvID == null) {
    return null;
  }

  let records = store.getRecords(props.currentEnvID);
  let selectedRecord = {};

  if (records != null) {
    selectedRecord = records[selectedRecordID];
  }

  return (
    <div className={styles.StoreInspector}>
      <div className={styles.Toolbar}>
        <button
          className={styles.RefreshButton}
          onClick={refreshStore}
          title="Refresh"
        >
          Refresh
        </button>
        <div className={styles.Spacer} />
      </div>
      <div className={styles.Content}>
        <RecordList
          records={records}
          selectedRecordID={selectedRecordID}
          setSelectedRecordID={setSelectedRecordID}
        />
        <RecordDetails selectedRecord={selectedRecord} />
      </div>
    </div>
  );
}
