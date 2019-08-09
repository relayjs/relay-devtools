// @flow

import React, { useCallback, useContext } from 'react';
import { SettingsModalContext } from './SettingsModalContext';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';

export default function SettingsModalContextToggle() {
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
