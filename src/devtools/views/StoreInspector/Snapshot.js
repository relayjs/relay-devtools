/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useState } from 'react';
import RecordList from './RecordList';
import RecordDetails from './RecordDetails';

import styles from './Snapshot.css';
import type { ReactSetStateFunction } from 'react';

export type Props = {|
  envSnapshotList: Object,
  envSnapshotListByType: Object,
  currentEnvID: ?number,
|};

function SnapshotList({
  snapshotList,
  setSelectedSnapshotID,
  selectedSnapshotID,
}: {|
  selectedSnapshotID: number | string,
  setSelectedSnapshotID: ReactSetStateFunction<number>,
  snapshotList: any,
|}) {
  const snapshotIDs = Object.keys(snapshotList).map(snapshotID => {
    return (
      <div
        key={snapshotID}
        onClick={() => {
          setSelectedSnapshotID((snapshotID: $FlowFixMe));
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
}: {|
  selectedSnapshotID: number | string,
  snapshotList: any,
  snapshotListByType: any,
|}) {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  const snapshotRecords = snapshotList[selectedSnapshotID];
  if (snapshotRecords == null) {
    return null;
  }
  const snapshotRecordsByType = snapshotListByType[selectedSnapshotID];
  const selectedRecord = snapshotRecords[selectedRecordID];

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

export default function Snapshots({
  envSnapshotList,
  envSnapshotListByType,
  currentEnvID,
}: Props): React$MixedElement {
  const [selectedSnapshotID, setSelectedSnapshotID] = useState(0);

  if (
    envSnapshotList == null ||
    Object.keys(envSnapshotList).length <= 0 ||
    currentEnvID == null ||
    envSnapshotList[currentEnvID] == null
  ) {
    return (
      <div className={styles.NoSnapshots}>
        No Snapshots! <br /> To take a snapshot, hit the snapshot button!
      </div>
    );
  }

  const snapshotList = envSnapshotList[currentEnvID];
  const snapshotListByType = envSnapshotListByType[currentEnvID];

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
