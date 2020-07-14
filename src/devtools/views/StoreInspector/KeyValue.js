/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  value: any,
  records: StoreRecords,
  setSelectedRecordID: (id: number) => void,
|};

function getDisplayValue(value, dataType) {
  return dataType === 'string'
    ? `"${value}"`
    : dataType === 'boolean'
    ? value.toString()
    : value === null
    ? 'null'
    : value === undefined
    ? 'undefined'
    : value;
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
      alphaSort
        ? Object.entries(value).sort(alphaSortEntries)
        : Object.entries(value),
    [value, alphaSort]
  );

  const toggleIsOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const dataType = typeof value;
  const isSimpleType = typeof value !== 'object' && value !== null;

  const style = {
    paddingLeft: `${(depth - 1) * 0.75}rem`,
  };

  if (isSimpleType) {
    let displayValue = getDisplayValue(value, dataType);

    if (value !== null && records.hasOwnProperty(value)) {
      return (
        <div key="root" className={styles.Item} hidden={hidden} style={style}>
          <div className={styles.ExpandCollapseToggleSpacer} />
          <span className={styles.Name}>{name}</span>
          <span
            className={styles.Value}
            onClick={() => {
              setSelectedRecordID(records[value].__id);
            }}
          >
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
        ? value.map((innerValue, index) => (
            <KeyValue
              key={index}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              name={index}
              path={path.concat(index)}
              value={value[index]}
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
      let recordFieldKey = sortedEntries[0][0];
      let nextReferencedRecordID = sortedEntries[0][1];
      let displayName =
        recordFieldKey !== '__ref'
          ? 'Object'
          : typeof nextReferencedRecordID === 'string'
          ? records[nextReferencedRecordID].__typename
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
