/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { copy } from 'clipboard-js';
import React, { useCallback, useMemo } from 'react';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import KeyValue from './KeyValue';
import { alphaSortEntries, serializeDataForCopy } from '../utils';
import styles from './InspectedElementTreeStoreInspector.css';
import type { StoreRecords } from '../../../types.js';

type Props = {|
  data: Object,
  label: string,
  records: StoreRecords,
  setSelectedRecordID: (id: number) => void,
  showWhenEmpty?: boolean,
|};

export default function InspectedElementTree({
  data,
  label,
  records,
  setSelectedRecordID,
  showWhenEmpty = false,
}: Props) {
  const sortedEntries = useMemo(
    () => Object.entries(data).sort(alphaSortEntries),
    [data]
  );

  const isEmpty = sortedEntries.length === 0;

  const handleCopy = useCallback(() => copy(serializeDataForCopy(data)), [
    data,
  ]);

  if (isEmpty && !showWhenEmpty) {
    return null;
  } else {
    return (
      <div className={styles.InspectedElementTree}>
        <div className={styles.HeaderRow}>
          <div className={styles.Header}>{label}</div>
          {!isEmpty && (
            <Button onClick={handleCopy} title="Copy to clipboard">
              <ButtonIcon type="copy" />
            </Button>
          )}
        </div>
        {isEmpty && <div className={styles.Empty}>None</div>}
        {!isEmpty &&
          (sortedEntries: any).map(([name, value]) => (
            <KeyValue
              key={name}
              alphaSort={true}
              depth={1}
              name={name}
              path={[name]}
              value={value}
              records={records}
              setSelectedRecordID={setSelectedRecordID}
            />
          ))}
      </div>
    );
  }
}
