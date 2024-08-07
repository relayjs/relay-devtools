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
  keyName: string,
  path: Array<any>,
  value: mixed,
  records: StoreRecords,
  setSelectedRecordID: (id: string) => void,
|};

const REF = '__ref';
const REFS = '__refs';

function getDisplayValue(value: mixed) {
  return typeof value === 'string'
    ? `"${value}"`
    : typeof value === 'boolean' || typeof value === 'number'
    ? value.toString()
    : value === null
    ? 'null'
    : 'undefined';
}

export default function KeyValue({
  alphaSort,
  depth,
  hidden,
  keyName,
  path,
  value,
  records,
  setSelectedRecordID,
}: KeyValueProps):
  | React.Element<'div'>
  | Array<React.Node>
  | Array<Element<any>>
  | Array<any | React.Element<'div'>> {
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
    // When this is called, the variable value is the next record referenced by the current record.
    const nextRecID =
      value !== null &&
      typeof value === 'object' &&
      value.hasOwnProperty('__id')
        ? ((value.__id: any): string)
        : null;
    if (nextRecID != null) {
      setSelectedRecordID(nextRecID);
    }
  }, [value, setSelectedRecordID]);

  const toggleIsOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const isSimpleType = typeof value !== 'object' && value !== null;

  const style = {
    paddingLeft: `${(depth - 1) * 0.75}rem`,
  };

  // If the value is a reference to another record
  // Edge case: the id or __id of a record is a reference but we don't want to
  // expand it
  if (
    value !== null &&
    records.hasOwnProperty(value) &&
    typeof value === 'string' &&
    records[value] != null &&
    (keyName === REF || path[path.length - 2] === REFS)
  ) {
    const referencedRecord = records[value];
    return (
      <div key="root" className={styles.Item} hidden={hidden} style={style}>
        <span className={styles.Value}>
          <KeyValue
            key={keyName}
            alphaSort={true}
            depth={depth + 1}
            keyName={keyName}
            path={[keyName]}
            value={referencedRecord}
            records={records}
            setSelectedRecordID={setSelectedRecordID}
          />
        </span>
      </div>
    );
  } else if (isSimpleType) {
    const displayValue = getDisplayValue(value);

    return (
      <div key="root" className={styles.Item} hidden={hidden} style={style}>
        <div className={styles.ExpandCollapseToggleSpacer} />
        <span className={styles.Name}>{keyName}</span>
        <span className={styles.Value}>{displayValue}</span>
      </div>
    );
  } else {
    if (Array.isArray(value)) {
      const hasChildren = value.length > 0;

      const children:
        | Array<React.Node>
        | Array<any | React.Element<'div'>> = wasEverOpen
        ? value.map((innerValue, mapIndex): React.Node => (
            <KeyValue
              key={mapIndex}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              keyName={mapIndex.toString()}
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
            {keyName}
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
      const entryReference = sortedEntries[0];
      const recordFieldKey = entryReference == null ? null : entryReference[0];
      const nextReferencedRecordID =
        entryReference == null ? null : entryReference[1];
      // In the case of a reference to another record, we want the displayName/value, to be
      // the id of the next record, so that users can click on it like a link
      const displayName =
        sortedEntries === []
          ? 'Object'
          : recordFieldKey !== REF || path[path.length - 2] === REFS
          ? keyName === REF &&
            value !== null &&
            typeof value === 'object' &&
            value.hasOwnProperty('__id')
            ? ((value.__id: any): string)
            : 'Object'
          : typeof nextReferencedRecordID === 'string' &&
            records[nextReferencedRecordID] != null
          ? ((records[nextReferencedRecordID].__typename: any): string)
          : 'Object';

      const children:
        | Array<Element<any>>
        | Array<any | React.Element<'div'>> = wasEverOpen
        ? sortedEntries.map(([entriesName, entriesVal]) => (
            <KeyValue
              key={entriesName}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              keyName={entriesName}
              path={path.concat(entriesName)}
              value={entriesVal}
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
            {keyName}
          </span>
          <span onClick={keyName === REF ? selectRecordID : null}>
            {`${displayName || ''} `}
            {hasChildren ? '' : <span className={styles.Empty}>(empty)</span>}
          </span>
        </div>
      );
      return children;
    }
  }
}
