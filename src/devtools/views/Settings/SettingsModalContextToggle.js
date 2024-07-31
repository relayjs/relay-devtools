/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useContext } from 'react';
import { SettingsModalContext } from './SettingsModalContext';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';

export default function SettingsModalContextToggle(): React$MixedElement {
  const { setIsModalShowing } = useContext(SettingsModalContext);

  const showFilterModal = useCallback(() => setIsModalShowing(true), [
    setIsModalShowing,
  ]);

  return (
    <Button onClick={showFilterModal} title="View settings">
      <ButtonIcon type="settings" />
    </Button>
  );
}
