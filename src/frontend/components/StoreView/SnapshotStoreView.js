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
import SnapshotRecordInspector from '../../containers/SnapshotRecordInspector';

export default class SnapshotStoreView extends StoreView {
  renderTableRecord = ({ id, type }) => {
    const { selectedRecord } = this.state;
    const { snapshotBefore, snapshotAfter } = this.props;
    const onClick = () => this.selectRecord(id);
    let className = selectedRecord === id ? 'selected' : '';

    // TODO instead of comparisons of snapshots, could have stored diffs in
    // relay-runtime. Cheaper to calculate, already calculated somewhere.
    const before = snapshotBefore[id];
    const after = snapshotAfter[id];

    if (before && !after) {
      className += ' removed';
    }
    if (!before && after) {
      className += ' added';
    }
    if (before && after) {
      className += ' changed';
    }

    return (
      <tr key={id} onClick={onClick} className={className}>
        <td>
          {id}
        </td>
        <td>
          {type}
        </td>
      </tr>
    );
  };

  renderDetails() {
    const { selectedRecord } = this.state;
    const { snapshotBefore, snapshotAfter } = this.props;
    const recordBefore = snapshotBefore[selectedRecord];
    const recordAfter = snapshotAfter[selectedRecord];

    if (!recordBefore && !recordAfter) {
      return <div className="placeholder" />;
    }

    let className = 'details-diff';
    let tag = 'Changed';

    if (!recordBefore) {
      className += ' added';
      tag = 'Added';
    }
    if (!recordAfter) {
      className += ' removed';
      tag = 'Removed';
    }

    return (
      <div className={className}>
        <SnapshotRecordInspector
          id={selectedRecord}
          tag={tag}
          snapshotBefore={snapshotBefore}
          snapshotAfter={snapshotAfter}
        />
      </div>
    );
  }

  getPlaceholderText() {
    return 'Store had no changes';
  }
}
