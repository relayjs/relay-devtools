/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

import React from 'react';
import StoreView from './StoreView';
import LatestRecordInspector from '../../containers/LatestRecordInspector';

export type Props = {
  refetchRecords: () => void,
  matchTerm: string,
  matchType: string,
};

// StoreView connected to the API fetching the latest records
export default class LatestStoreView extends StoreView {
  componentDidMount() {
    this.props.refetchRecords();
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.matchTerm !== this.props.matchTerm ||
      prevProps.matchType !== this.props.matchType
    ) {
      this.props.refetchRecords();
    }
  }

  renderDetails() {
    const {selectedRecord} = this.state;
    return <LatestRecordInspector id={selectedRecord} />;
  }
}
