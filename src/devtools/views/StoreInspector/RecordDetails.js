/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import InspectedElementTreeStoreInspector from './InspectedElementTreeStoreInspector';
import type { StoreRecords, Record } from '../../../types';

import styles from './RecordDetails.css';

export type Props = {|
  records: StoreRecords,
  selectedRecord: ?Record,
  setSelectedRecordID: string => void,
|};

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
  );
}

export default function RecordDetails({
  records,
  selectedRecord,
  setSelectedRecordID,
}: Props) {
  if (selectedRecord == null) {
    return <div className={styles.RecordDetails}>No record selected</div>;
  }

  const { __id, __typename, ...data } = selectedRecord;

  const typename: string = (__typename: any);
  const id: string = (__id: any);

  return (
    <div className={styles.RecordDetails}>
      <Section title="ID">{id}</Section>
      <Section title="Type">{typename}</Section>
      <InspectedElementTreeStoreInspector
        label="Store data"
        data={data}
        records={records}
        setSelectedRecordID={setSelectedRecordID}
        showWhenEmpty
      />
    </div>
  );
}
