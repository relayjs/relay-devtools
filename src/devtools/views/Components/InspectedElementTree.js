/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { copy } from 'clipboard-js';
import React, { useCallback } from 'react';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import KeyValue from './KeyValue';
import { alphaSortEntries, serializeDataForCopy } from '../utils';
import styles from './InspectedElementTree.css';

type Props = {|
  data: Object | null,
  label: string,
  showWhenEmpty?: boolean,
|};

export default function InspectedElementTree({
  data,
  label,
  showWhenEmpty = false,
}: Props): null | React$MixedElement {
  //TODO(damassart): Clean this up
  const entries = data != null ? Object.entries(data) : null;
  if (entries !== null) {
    entries.sort(alphaSortEntries);
  }

  const isEmpty = entries === null || entries.length === 0;

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
          (entries: any).map(([name, value]) => (
            <KeyValue
              key={name}
              alphaSort={true}
              depth={1}
              name={name}
              path={[name]}
              value={value}
            />
          ))}
      </div>
    );
  }
}
