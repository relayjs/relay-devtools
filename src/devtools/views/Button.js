/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import Tooltip from '@reach/tooltip';

import styles from './Button.css';
import tooltipStyles from './Tooltip.css';

type Props = {
  children: React$Node,
  className?: string,
  title?: string,
  ...
};

export default function Button({
  children,
  className = '',
  title = '',
  ...rest
}: Props): React$MixedElement {
  const innerButton = (
    <button {...rest} className={`${styles.Button} ${className}`}>
      <span className={`${styles.ButtonContent} ${className}`} tabIndex={-1}>
        {children}
      </span>
    </button>
  );

  if (title) {
    return (
      <Tooltip className={tooltipStyles.Tooltip} label={title}>
        {innerButton}
      </Tooltip>
    );
  }

  return innerButton;
}
