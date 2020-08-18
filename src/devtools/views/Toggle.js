/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback } from 'react';
import Tooltip from '@reach/tooltip';

import styles from './Toggle.css';
import tooltipStyles from './Tooltip.css';

type Props = {
  children: React$Node,
  className?: string,
  isChecked: boolean,
  isDisabled?: boolean,
  onChange: (isChecked: boolean) => void,
  title?: string,
};

export default function Toggle({
  children,
  className = '',
  isDisabled = false,
  isChecked,
  onChange,
  title,
}: Props) {
  const defaultClassName = isDisabled
    ? styles.ToggleDisabled
    : isChecked
    ? styles.ToggleOn
    : styles.ToggleOff;

  const handleClick = useCallback(() => onChange(!isChecked), [
    isChecked,
    onChange,
  ]);

  const innerToggle = (
    <button
      className={`${defaultClassName} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
    >
      <span className={styles.ToggleContent} tabIndex={-1}>
        {children}
      </span>
    </button>
  );

  if (title) {
    return (
      <Tooltip className={tooltipStyles.Tooltip} label={title}>
        {innerToggle}
      </Tooltip>
    );
  }

  return innerToggle;
}
