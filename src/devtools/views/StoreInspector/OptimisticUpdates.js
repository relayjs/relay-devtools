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
import type { StoreRecords } from '../../../types';

import styles from './OptimisticUpdates.css';

export type Props = {|
  optimisticUpdates: ?StoreRecords,
|};

export default function Optimistic({ optimisticUpdates }: Props) {
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
