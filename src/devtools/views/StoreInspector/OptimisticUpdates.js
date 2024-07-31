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

export default function Optimistic({ optimisticUpdates }: Props): React$MixedElement {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  if (optimisticUpdates == null) {
    return (
      <div className={styles.NoOptimisticUpdates}>No Optimistic Updates!</div>
    );
  }
  const optimisticUpdatesByType = new Map<mixed, Array<string>>();

  for (const key in optimisticUpdates) {
    const rec = optimisticUpdates[key];
    if (rec != null) {
      const arr = optimisticUpdatesByType.get(rec.__typename);
      if (arr) {
        arr.push(key);
      } else {
        optimisticUpdatesByType.set(rec.__typename, [key]);
      }
    }
  }

  const selectedRecord = optimisticUpdates[selectedRecordID];

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
