/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Element } from 'react';
// import EditableValue from './EditableValue';
import ExpandCollapseToggle from '../Components/ExpandCollapseToggle';
import { alphaSortEntries } from '../utils';
import styles from './KeyValue.css';
import type { StoreRecords } from '../../../types.js';

type KeyValueProps = {|
  alphaSort: boolean,
  depth: number,
  hidden?: boolean,
  name: string,
  path: Array<any>,
  value: mixed,
  records: StoreRecords,
  setSelectedRecordID: (id: string) => void,
|};

function getDisplayValue(value) {
  return typeof value === 'string'
    ? `"${value}"`
    : typeof value === 'boolean'
    ? value.toString()
    : value === null
    ? 'null'
    : 'undefined';
}

export default function KeyValue({
  alphaSort,
  depth,
  hidden,
  name,
  path,
  value,
  records,
  setSelectedRecordID,
}: KeyValueProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [wasEverOpen, setWasEverOpen] = useState<boolean>(isOpen);
  useEffect(() => {
    if (isOpen && !wasEverOpen) {
      setWasEverOpen(true);
    }
  }, [isOpen, wasEverOpen]);
  const sortedEntries = useMemo(
    () =>
      value !== null && typeof value === 'object'
        ? alphaSort
          ? Object.entries(value).sort(alphaSortEntries)
          : Object.entries(value)
        : [],
    [value, alphaSort]
  );
  const selectRecordID = useCallback(() => {
    if (
      typeof value === 'string' &&
      records[value] != null &&
      typeof records[value].__id === 'string'
    ) {
      let id = records[value].__id;
      setSelectedRecordID(id);
    }
  }, [records, value, setSelectedRecordID]);

  const toggleIsOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const isSimpleType = typeof value !== 'object' && value !== null;

  const style = {
    paddingLeft: `${(depth - 1) * 0.75}rem`,
  };

  if (isSimpleType) {
    let displayValue = getDisplayValue(value);

    if (
      value !== null &&
      records.hasOwnProperty(value) &&
      typeof value === 'string'
    ) {
      return (
        <div key="root" className={styles.Item} hidden={hidden} style={style}>
          <div className={styles.ExpandCollapseToggleSpacer} />
          <span className={styles.Name}>{name}</span>
          <span className={styles.Value} onClick={selectRecordID}>
            {displayValue}
          </span>
        </div>
      );
    } else {
      return (
        <div key="root" className={styles.Item} hidden={hidden} style={style}>
          <div className={styles.ExpandCollapseToggleSpacer} />
          <span className={styles.Name}>{name}</span>
          <span className={styles.Value}>{displayValue}</span>
        </div>
      );
    }
  } else {
    if (Array.isArray(value)) {
      const hasChildren = value.length > 0;

      let children = wasEverOpen
        ? value.map<React.Node>((innerValue, mapIndex): React.Node => (
            <KeyValue
              key={mapIndex}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              name={mapIndex.toString()}
              path={path.concat(mapIndex)}
              value={value[mapIndex]}
              records={records}
              setSelectedRecordID={setSelectedRecordID}
            />
          ))
        : [];
      children.unshift(
        <div
          key={`${depth}-root`}
          className={styles.Item}
          hidden={hidden}
          style={style}
        >
          {hasChildren ? (
            <ExpandCollapseToggle isOpen={isOpen} setIsOpen={setIsOpen} />
          ) : (
            <div className={styles.ExpandCollapseToggleSpacer} />
          )}
          <span
            className={styles.Name}
            onClick={hasChildren ? toggleIsOpen : undefined}
          >
            {name}
          </span>
          <span>
            Array
            {hasChildren ? '' : <span className={styles.Empty}>(empty)</span>}
          </span>
        </div>
      );
      return children;
    } else {
      const hasChildren = sortedEntries.length > 0;
      // sortedEntries contains an array of tuples which contain a string and a value.
      // In some cases, the string is a __ref. In this case, there should be no other values
      // within the array because __ref is a reference to another record.
      let entryReference = sortedEntries[0];
      let recordFieldKey = entryReference == null ? null : entryReference[0];
      let nextReferencedRecordID =
        entryReference == null ? null : entryReference[1];
      let displayName =
        sortedEntries === []
          ? 'Object '
          : recordFieldKey !== '__ref'
          ? 'Object'
          : typeof nextReferencedRecordID === 'string' &&
            records[nextReferencedRecordID] != null
          ? ((records[nextReferencedRecordID].__typename: any): string)
          : 'Object';

      let children = wasEverOpen
        ? sortedEntries.map<Element<any>>(([name, value]) => (
            <KeyValue
              key={name}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              name={name}
              path={path.concat(name)}
              value={value}
              records={records}
              setSelectedRecordID={setSelectedRecordID}
            />
          ))
        : [];
      children.unshift(
        <div
          key={`${depth}-root`}
          className={styles.Item}
          hidden={hidden}
          style={style}
        >
          {hasChildren ? (
            <ExpandCollapseToggle isOpen={isOpen} setIsOpen={setIsOpen} />
          ) : (
            <div className={styles.ExpandCollapseToggleSpacer} />
          )}
          <span
            className={styles.Name}
            onClick={hasChildren ? toggleIsOpen : undefined}
          >
            {name}
          </span>
          <span>
            {`${displayName || ''} `}
            {hasChildren ? '' : <span className={styles.Empty}>(empty)</span>}
          </span>
        </div>
      );
      return children;
    }
  }
}
