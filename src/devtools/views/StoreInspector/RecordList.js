/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useState } from 'react';

import styles from './RecordList.css';

import type { StoreRecords } from '../../../types';

export type Props = {|
  records: StoreRecords,
  recordsByType: any,
  selectedRecordID: string,
  setSelectedRecordID: string => void,
|};

export default function RecordList({
  records,
  recordsByType,
  selectedRecordID,
  setSelectedRecordID,
}: Props) {
  const [recordSearch, setRecordSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setRecordSearch(e.target.value);
  }, []);
  const [recordListStyles, setRecordListStyles] = useState({});
  const [plusMinusCollapse, setPlusMinusCollapse] = useState({});

  if (records == null || recordsByType == null) {
    return <div>Loading...</div>;
  }

  const recordsArray = Array.from(recordsByType).map((recs, _) => {
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
