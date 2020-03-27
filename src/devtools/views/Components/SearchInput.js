/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import Icon from '../Icon';

import styles from './SearchInput.css';

type Props = {|
  searchText: string,
  onTextChange: (text: string) => void,
|};

export default function SearchInput({ searchText, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleTextChange = useCallback(
    ({ currentTarget }) => onChange(currentTarget.value),
    [onChange]
  );

  // Auto-focus search input
  useEffect(() => {
    if (inputRef.current === null) {
      return () => {};
    }

    const handleWindowKey = (event: KeyboardEvent) => {
      const { key, metaKey } = event;
      if (key === 'f' && metaKey) {
        if (inputRef.current !== null) {
          inputRef.current.focus();
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    // It's important to listen to the ownerDocument to support the browser extension.
    // Here we use portals to render individual tabs (e.g. Profiler),
    // and the root document might belong to a different window.
    const ownerDocument = inputRef.current.ownerDocument;
    ownerDocument.addEventListener('keydown', handleWindowKey);

    return () => ownerDocument.removeEventListener('keydown', handleWindowKey);
  }, [inputRef]);

  return (
    <div className={styles.SearchInput}>
      <Icon className={styles.InputIcon} type="search" />
      <input
        className={styles.Input}
        onChange={handleTextChange}
        placeholder="Search (ID or type)"
        ref={inputRef}
        value={searchText}
      />
    </div>
  );
}
