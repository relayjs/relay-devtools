/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import StoreView from './StoreView';
import LatestRecordInspector from '../../containers/LatestRecordInspector';

// StoreView connected to the API fetching the latest records
export default class LatestStoreView extends StoreView {
  componentDidMount() {
    this.props.refetchRecords();
  }

  renderDetails() {
    const {selectedRecord} = this.state;
    return <LatestRecordInspector id={selectedRecord} />;
  }
}
