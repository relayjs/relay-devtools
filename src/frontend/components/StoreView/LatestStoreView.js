/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
