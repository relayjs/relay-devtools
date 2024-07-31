/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import classNames from 'classnames';
import React, { Fragment, useCallback } from 'react';
import Tooltip from '@reach/tooltip';

import styles from './StoreTabBar.css';
import tooltipStyles from '../Tooltip.css';

type TabInfo = {|
  id: string,
  label: string,
  title?: string,
|};

export type Props = {|
  tabID: string,
  disabled?: boolean,
  id: string,
  selectTab: (tab: TabInfo) => void,
  size: 'large' | 'small',
  tabs: Array<TabInfo>,
|};

export default function TabBar({
  tabID,
  disabled = false,
  id: groupName,
  selectTab,
  size,
  tabs,
}: Props): React$MixedElement{
  if (!tabs.some(tab => tab.id === tabID)) {
    selectTab(tabs[0]);
  }

  const onChange = useCallback(
    ({currentTarget}: any) => selectTab(currentTarget.value),
    [selectTab]
  );

  const tabClassName =
    size === 'large' ? styles.TabSizeLarge : styles.TabSizeSmall;

  return (
    <Fragment>
      {tabs.map(tab => {
        const innerButton = (
          <label
            className={classNames(
              tabClassName,
              disabled ? styles.TabDisabled : styles.Tab,
              !disabled && tabID === tab.id ? styles.TabCurrent : null
            )}
            key={tab.id}
            onMouseDown={() => selectTab(tab)}
          >
            <input
              type="radio"
              className={styles.Input}
              checked={tabID === tab.id}
              disabled={disabled}
              name={groupName}
              value={tab.id}
              onChange={onChange}
            />
            <span
              className={
                size === 'large' ? styles.TabLabelLarge : styles.TabLabelSmall
              }
            >
              {tab.label}
            </span>
          </label>
        );

        if (tab.title) {
          return (
            <Tooltip
              key={tab.id}
              className={tooltipStyles.Tooltip}
              label={tab.title}
            >
              {innerButton}
            </Tooltip>
          );
        }

        return innerButton;
      })}
    </Fragment>
  );
}
