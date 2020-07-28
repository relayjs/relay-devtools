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
import InspectedElementTree from './InspectedElementTreeStoreInspector';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import { copy } from 'clipboard-js';
import { serializeDataForCopy } from '../utils';
import TabBar from './StoreTabBar';

import styles from './StoreInspector.css';

export type TabID = 'explorer' | 'snapshot' | 'watchlist' | 'optimistic';
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
const watchListTab = {
  id: ('watchlist': TabID),
  label: 'Watchlist',
  title: 'Relay Watchlist',
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

const tabs = [explorerTab, snapshotTab, watchListTab, optimisticTab];

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
  );
}

function RecordList({
  records,
  recordsByType,
  selectedRecordID,
  setSelectedRecordID,
}) {
  const [recordSearch, setRecordSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setRecordSearch(e.target.value);
  }, []);
  const [recordListStyles, setRecordListStyles] = useState({});
  const [plusMinusCollapse, setPlusMinusCollapse] = useState({});

  if (records == null || recordsByType == null) {
    return <div>Loading...</div>;
  }

  let recordsArray = Array.from(recordsByType).map((recs, _) => {
    const typename = ((recs[0]: any): string);
    const ids = recs[1];

    return (
      <div key={typename}>
        <div className={styles.Collapse}>
          <button
            key={typename}
            onClick={() => {
              if (recordListStyles[typename] === 'none') {
                setRecordListStyles({
                  ...recordListStyles,
                  [typename]: 'block',
                });
                setPlusMinusCollapse({ ...plusMinusCollapse, [typename]: '-' });
              } else {
                setRecordListStyles({
                  ...recordListStyles,
                  [typename]: 'none',
                });
                setPlusMinusCollapse({ ...plusMinusCollapse, [typename]: '+' });
              }
            }}
            className={styles.Type}
          >
            {typename}
          </button>
          <span className={styles.PlusMinusCollapse}>
            {plusMinusCollapse[typename] == null
              ? '-'
              : plusMinusCollapse[typename]}
          </span>
        </div>
        <div
          className={styles.RecordListContent}
          style={{
            display:
              recordListStyles[typename] == null
                ? 'block'
                : recordListStyles[typename],
          }}
        >
          {ids
            .filter(id =>
              recordSearch
                .trim()
                .split(' ')
                .some(
                  search =>
                    id.toLowerCase().includes(search.toLowerCase()) ||
                    typename.toLowerCase().includes(search.toLowerCase())
                )
            )
            .map(id => {
              return (
                <div
                  key={id}
                  onClick={() => {
                    setSelectedRecordID(id);
                  }}
                  className={`${styles.Record} ${
                    id === selectedRecordID ? styles.SelectedRecord : ''
                  }`}
                >
                  {id}
                </div>
              );
            })}
        </div>
        <hr />
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
      {recordsArray.length <= 0 && recordSearch !== '' ? (
        <p className={styles.RecordNotFound}>
          Sorry, no records with the name '{recordSearch}' were found!
        </p>
      ) : (
        recordsArray
      )}
    </div>
  );
}

function RecordDetails({ records, selectedRecord, setSelectedRecordID }) {
  if (selectedRecord == null) {
    return <div className={styles.RecordDetails}>No record selected</div>;
  }

  const { __id, __typename, ...data } = selectedRecord;

  let typename: string = (__typename: any);
  let id: string = (__id: any);

  return (
    <div className={styles.RecordDetails}>
      <Section title="ID">{id}</Section>
      <Section title="Type">{typename}</Section>
      <InspectedElementTree
        label="Store data"
        data={data}
        records={records}
        setSelectedRecordID={setSelectedRecordID}
        showWhenEmpty
      />
    </div>
  );
}

function SnapshotList({
  snapshotList,
  setSelectedSnapshotID,
  selectedSnapshotID,
}) {
  let snapshotIDs = Object.keys(snapshotList).map(snapshotID => {
    return (
      <div
        key={snapshotID}
        onClick={() => {
          setSelectedSnapshotID(snapshotID);
        }}
        className={`${styles.Record} ${
          snapshotID === selectedSnapshotID ? styles.SelectedRecord : ''
        }`}
      >
        {snapshotID}
      </div>
    );
  });

  return (
    <div className={styles.SnapshotList}>
      <h2>Snapshots</h2>
      <div>{snapshotIDs}</div>
    </div>
  );
}

function SnapshotDetails({
  snapshotList,
  snapshotListByType,
  selectedSnapshotID,
}) {
  const [selectedRecordID, setSelectedRecordID] = useState(0);
  let snapshotRecords = snapshotList[selectedSnapshotID];
  if (snapshotRecords == null) {
    return null;
  }
  let snapshotRecordsByType = snapshotListByType[selectedSnapshotID];
  let selectedRecord = snapshotRecords[selectedRecordID];

  return (
    <div className={styles.TabContent}>
      <RecordList
        records={snapshotRecords}
        recordsByType={snapshotRecordsByType}
        selectedRecordID={selectedRecordID}
        setSelectedRecordID={setSelectedRecordID}
      />
      <RecordDetails
        records={snapshotRecords}
        setSelectedRecordID={setSelectedRecordID}
        selectedRecord={selectedRecord}
      />
    </div>
  );
}

function Snapshots({ envSnapshotList, envSnapshotListByType, currentEnvID }) {
  const [selectedSnapshotID, setSelectedSnapshotID] = useState(0);

  if (
    envSnapshotList == null ||
    Object.keys(envSnapshotList).length <= 0 ||
    currentEnvID == null ||
    envSnapshotList[currentEnvID] == null
  ) {
    return (
      <div>
        No Snapshots! <br /> To take a snapshot, hit the snapshot button!
      </div>
    );
  }

  let snapshotList = envSnapshotList[currentEnvID];
  let snapshotListByType = envSnapshotListByType[currentEnvID];

  return (
    <div className={styles.TabContent}>
      <SnapshotList
        snapshotList={snapshotList}
        setSelectedSnapshotID={setSelectedSnapshotID}
        selectedSnapshotID={selectedSnapshotID}
      />
      <SnapshotDetails
        snapshotList={snapshotList}
        snapshotListByType={snapshotListByType}
        selectedSnapshotID={selectedSnapshotID}
      />
    </div>
  );
}

function WatchList() {
  return null;
}

function Optimistic({ optimisticUpdates }) {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  if (optimisticUpdates == null) {
    return <div>No Optimistic Updates!</div>;
  }
  let optimisticUpdatesByType = new Map();

  for (let key in optimisticUpdates) {
    let rec = optimisticUpdates[key];
    if (rec != null) {
      let arr = optimisticUpdatesByType.get(rec.__typename);
      if (arr) {
        arr.push(key);
      } else {
        optimisticUpdatesByType.set(rec.__typename, [key]);
      }
    }
  }

  let selectedRecord = optimisticUpdates[selectedRecordID];

  return (
    <div className={styles.TabContent}>
      <RecordList
        records={optimisticUpdates}
        recordsByType={optimisticUpdatesByType}
        selectedRecordID={selectedRecordID}
        setSelectedRecordID={setSelectedRecordID}
      />
      <RecordDetails
        records={optimisticUpdates}
        setSelectedRecordID={setSelectedRecordID}
        selectedRecord={selectedRecord}
      />
    </div>
  );
}

function deepCopyFunction(inObject) {
  if (typeof inObject !== 'object' || inObject === null) {
    return inObject;
  }

  if (Array.isArray(inObject)) {
    let outObject = [];
    for (let i = 0; i < inObject.length; i++) {
      let value = inObject[i];
      outObject[i] = deepCopyFunction(value);
    }
    return outObject;
  } else if (inObject instanceof Map) {
    let outObject = new Map();
    inObject.forEach((val, key) => {
      outObject.set(key, deepCopyFunction(val));
    });
    return outObject;
  } else {
    let outObject = {};
    for (let key in inObject) {
      let value = inObject[key];
      if (typeof key === 'string' && key != null) {
        outObject[key] = deepCopyFunction(value);
      }
    }
    return outObject;
  }
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

  useEffect(() => {
    const onStoreData = () => {
      forceUpdate({});
    };
    store.addListener('storeDataReceived', onStoreData);
    return () => {
      store.removeListener('storeDataReceived', onStoreData);
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
        {tab === watchListTab && (
          <div className={styles.TabContent}>
            <WatchList />
          </div>
        )}
        {tab === optimisticTab && (
          <div className={styles.TabContent}>
            <Optimistic optimisticUpdates={optimisticUpdates} />
          </div>
        )}
      </div>
    </div>
  );
}
