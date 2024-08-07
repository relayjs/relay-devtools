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

function appearsInObject(searchText: string, obj: Object): boolean {
  if (obj == null) {
    return false;
  }
  for (const key in obj) {
    if (typeof obj[key] == 'object' && obj[key] !== null) {
      const appears: boolean = appearsInObject(searchText, obj[key]);
      if (appears) {
        return appears;
      }
    } else if (
      (obj[key] !== null &&
        obj[key]
          .toString()
          .toLowerCase()
          .includes(searchText)) ||
      key
        .toString()
        .toLowerCase()
        .includes(searchText)
    ) {
      return true;
    }
  }
  return false;
}

export default function RecordList({
  records,
  recordsByType,
  selectedRecordID,
  setSelectedRecordID,
}: Props): React$MixedElement {
  const [recordSearch, setRecordSearch] = useState('');
  const fetchSearchBarText = useCallback(
    (e: any) => {
      setSelectedRecordID('');
      setRecordSearch(e.target.value);
    },
    [setSelectedRecordID]
  );
  const [recordListStyles, setRecordListStyles] = useState<{ [string]: any }>(
    {}
  );
  const [plusMinusCollapse, setPlusMinusCollapse] = useState<{ [string]: any }>(
    {}
  );

  if (records == null || recordsByType == null) {
    return <div className={styles.Loading}>Loading...</div>;
  }

  const recordsArray = Array.from(recordsByType).flatMap((recs, _) => {
    const typename = ((recs[0]: any): string);
    const ids = recs[1];
    const filtered_ids = ids.filter(id =>
      recordSearch
        .trim()
        .split(' ')
        .some(
          search =>
            id.toLowerCase().includes(search.toLowerCase()) ||
            typename.toLowerCase().includes(search.toLowerCase()) ||
            (records[id] != null &&
              appearsInObject(search.toLowerCase(), records[id]))
        )
    );

    if (filtered_ids.length <= 0) {
      return ([]: $FlowFixMe);
    }

    return [
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
          {filtered_ids.map(id => {
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
      </div>,
    ];
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
