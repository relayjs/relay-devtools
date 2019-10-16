// @flow

import React, { useState } from 'react';
import type { Element } from 'react';
// import EditableValue from './EditableValue';
import ExpandCollapseToggle from './ExpandCollapseToggle';
import { alphaSortEntries } from '../utils';
// import { meta } from '../../../hydration';
import styles from './KeyValue.css';

type OverrideValueFn = (path: Array<string | number>, value: any) => void;

type KeyValueProps = {|
  alphaSort: boolean,
  depth: number,
  hidden?: boolean,
  isReadOnly?: boolean,
  name: string,
  overrideValueFn?: ?OverrideValueFn,
  path: Array<any>,
  value: any,
|};

export default function KeyValue({
  alphaSort,
  depth,
  isReadOnly,
  hidden,
  name,
  overrideValueFn,
  path,
  value,
}: KeyValueProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  let children = null;
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

    const isEditable = typeof overrideValueFn === 'function' && !isReadOnly;

    children = (
      <div key="root" className={styles.Item} hidden={hidden} style={style}>
        <div className={styles.ExpandCollapseToggleSpacer} />
        <span className={isEditable ? styles.EditableName : styles.Name}>
          {name}
        </span>
        {isEditable ? (
          /* <EditableValue
            dataType={dataType}
            overrideValueFn={((overrideValueFn: any): OverrideValueFn)}
            path={path}
            value={value}
          /> */
          'NOT SUPPORTED'
        ) : (
          <span className={styles.Value}>{displayValue}</span>
        )}
      </div>
    );
  } else {
    if (Array.isArray(value)) {
      const hasChildren = value.length > 0;

      children = value.map((innerValue, index) => (
        <KeyValue
          key={index}
          alphaSort={alphaSort}
          depth={depth + 1}
          isReadOnly={isReadOnly}
          hidden={hidden || !isOpen}
          name={index}
          overrideValueFn={overrideValueFn}
          path={path.concat(index)}
          value={value[index]}
        />
      ));
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
            Array{' '}
            {hasChildren ? '' : <span className={styles.Empty}>(empty)</span>}
          </span>
        </div>
      );
    } else {
      // TRICKY
      // It's important to use Object.entries() rather than Object.keys()
      // because of the hidden meta Symbols used for hydration and unserializable values.
      const entries = Object.entries(value);
      if (alphaSort) {
        entries.sort(alphaSortEntries);
      }

      const hasChildren = entries.length > 0;
      const displayName = 'Object';

      let areChildrenReadOnly = isReadOnly; /*|| !!value[meta.readonly]*/
      children = entries.map<Element<any>>(([name, value]) => (
        <KeyValue
          key={name}
          alphaSort={alphaSort}
          depth={depth + 1}
          isReadOnly={areChildrenReadOnly}
          hidden={hidden || !isOpen}
          name={name}
          overrideValueFn={overrideValueFn}
          path={path.concat(name)}
          value={value}
        />
      ));
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
    }
  }

  return children;
}
