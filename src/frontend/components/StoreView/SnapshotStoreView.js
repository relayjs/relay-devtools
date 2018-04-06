/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import StoreView from './StoreView';
import SnapshotRecordInspector from '../../containers/SnapshotRecordInspector';

export default class SnapshotStoreView extends StoreView {
  getPlaceholderText = () => {
    return 'No changes';
  };

  renderTableRecord(id, type) {
    const {selectedRecord} = this.state;
    const {snapshotBefore, snapshotAfter} = this.props;
    const onClick = () => this.selectRecord(id);
    let className = selectedRecord === id ? 'selected' : '';

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
        <td>{id}</td>
        <td>{type}</td>
      </tr>
    );
  }

  renderDetails() {
    const {selectedRecord} = this.state;
    const {snapshotBefore, snapshotAfter} = this.props;
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
