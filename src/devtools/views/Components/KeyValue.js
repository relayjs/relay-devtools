/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useState } from 'react';
import type { Element } from 'react';
// import EditableValue from './EditableValue';
import ExpandCollapseToggle from './ExpandCollapseToggle';
import { alphaSortEntries } from '../utils';
import styles from './KeyValue.css';

type KeyValueProps = {|
  alphaSort: boolean,
  depth: number,
  hidden?: boolean,
  name: string,
  path: Array<any>,
  value: any,
|};

export default function KeyValue({
  alphaSort,
  depth,
  hidden,
  name,
  path,
  value,
}: KeyValueProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [wasOpen, setWasOpen] = useState<boolean>(isOpen);
  if (isOpen && !wasOpen) {
    setWasOpen(true);
  }

  const toggleIsOpen = () => setIsOpen(prevIsOpen => !prevIsOpen);

  const dataType = typeof value;
  const isSimpleType =
    dataType === 'number' ||
    dataType === 'string' ||
    dataType === 'boolean' ||
    value == null;

  const style = {
    paddingLeft: `${(depth - 1) * 0.75}rem`,
  };
  //TODO(damassart): Make this into a function
  if (isSimpleType) {
    let displayValue = value;
    if (dataType === 'string') {
      displayValue = `"${value}"`;
    } else if (dataType === 'boolean') {
      displayValue = value ? 'true' : 'false';
    } else if (value === null) {
      displayValue = 'null';
    } else if (value === undefined) {
      displayValue = 'undefined';
    }

    return (
      <div key="root" className={styles.Item} hidden={hidden} style={style}>
        <div className={styles.ExpandCollapseToggleSpacer} />
        <span className={styles.Name}>{name}</span>
        <span className={styles.Value}>{displayValue}</span>
      </div>
    );
  } else {
    if (Array.isArray(value)) {
      const hasChildren = value.length > 0;

      const children = wasOpen
        ? value.map((innerValue, index) => (
            <KeyValue
              key={index}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              name={index}
              path={path.concat(index)}
              value={value[index]}
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
      //TODO(damassart): Fix this
      const entries = Object.entries(value);
      if (alphaSort) {
        entries.sort(alphaSortEntries);
      }

      const hasChildren = entries.length > 0;
      const displayName = 'Object';

      const children = wasOpen
        ? entries.map<Element<any>>(([entriesName, entriesVal]) => (
            <KeyValue
              key={entriesName}
              alphaSort={alphaSort}
              depth={depth + 1}
              hidden={hidden || !isOpen}
              name={entriesName}
              path={path.concat(entriesName)}
              value={entriesVal}
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
