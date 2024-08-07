/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useContext } from 'react';
import { SettingsContext } from './SettingsContext';

import styles from './SettingsShared.css';

export default function GeneralSettings(_: {||}): React$MixedElement {
  const { displayDensity, setDisplayDensity, theme, setTheme } = useContext(
    SettingsContext
  );

  const updateDisplayDensity = useCallback(
    ({ currentTarget }: any) => {
      setDisplayDensity(currentTarget.value);
    },
    [setDisplayDensity]
  );
  const updateTheme = useCallback(
    ({ currentTarget }: any) => {
      setTheme(currentTarget.value);
    },
    [setTheme]
  );

  return (
    <div className={styles.Settings}>
      <div className={styles.Setting}>
        <div className={styles.RadioLabel}>Theme</div>
        <select className={styles.Select} value={theme} onChange={updateTheme}>
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className={styles.Setting}>
        <div className={styles.RadioLabel}>Display density</div>
        <select
          className={styles.Select}
          value={displayDensity}
          onChange={updateDisplayDensity}
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
        </select>
      </div>
    </div>
  );
}
