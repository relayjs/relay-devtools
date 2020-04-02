/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StoreContext } from '../context';
import InspectedElementTree from '../Components/InspectedElementTree';
import SearchInput from '../Components/SearchInput';

import portaledContent from '../portaledContent';
import styles from './StoreInspector.css';

function getRecordData(records: { [string]: any }, record: any): any {
  if (Array.isArray(record)) {
    return record.map(r => getRecordData(records, r));
  } else if (record !== null && typeof record === 'object') {
    let result: any = {};
    for (const [key, value] of Object.entries(record)) {
      if (key === '__ref') {
        result = getRecordData(records, records[(value: any)]);
      } else if (key === '__refs') {
        result = (value: any).map(r => getRecordData(records, records[r]));
      } else {
        result[key] = getRecordData(records, value);
      }
    }
    return result;
  } else {
    return record;
  }
}

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
  );
}

function RecordsList({ records, selectedRecordID, setSelectedRecordID }) {
  const [searchText, setSearchText] = useState('');

  const handleSearchTextChange = useCallback(text => {
    setSearchText(text);
  }, []);

  const recordRows = Object.keys(records)
    .filter(
      recordID =>
        searchText.length === 0 ||
        recordID.startsWith(searchText) ||
        records[recordID].__typename.startsWith(searchText)
    )
    .map(recordID => {
      return (
        <div
          key={recordID}
          onClick={() => {
            setSelectedRecordID(recordID);
          }}
          className={`${styles.Record} ${
            recordID === selectedRecordID ? styles.SelectedRequest : ''
          }`}
        >
          {recordID}
        </div>
      );
    });

  return (
    <div className={styles.Records}>
      <SearchInput searchText={searchText} onChange={handleSearchTextChange} />
      {recordRows}>
    </div>
  );
}

function RecordDetails({ record, records }) {
  if (record == null) {
    return <div className={styles.RecordDetails}>No record selected</div>;
  }

  const { __id, __typename, ...data } = record;

  return (
    <div className={styles.RecordDetails}>
      <Section title="ID">{__id}</Section>
      <Section title="Type">{__typename}</Section>
      <InspectedElementTree
        label="Data"
        data={getRecordData(records, data)}
        showWhenEmpty
      />
    </div>
  );
}

function StoreInspector(props: {| +portalContainer: mixed |}) {
  const store = useContext(StoreContext);

  const [, forceUpdate] = useState({});

  useEffect(() => {
    const onMutated = () => {
      forceUpdate({});
    };
    store.addListener('mutated', onMutated);
    return () => {
      store.removeListener('mutated', onMutated);
    };
  }, [store]);

  const records = store.getRecords();

  const [selectedRecordID, setSelectedRecordID] = useState(null);

  if (records == null) {
    return 'Loading...';
  }

  return (
    <div className={styles.StoreInspector}>
      <div className={styles.Content}>
        <RecordsList
          records={records}
          selectedRecordID={selectedRecordID}
          setSelectedRecordID={setSelectedRecordID}
        />
        <RecordDetails records={records} record={records[selectedRecordID]} />
      </div>
    </div>
  );
}

export default portaledContent(StoreInspector);
