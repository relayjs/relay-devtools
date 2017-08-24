/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

import RecordInspector from './RecordInspector';
import RecordFields from './RecordFields';
import InlineDiffRecordFields from './InlineDiffRecordFields';

export default class SnapshotRecordInspector extends RecordInspector {
  renderToolbar() {
    const { tag } = this.props;

    if (tag !== 'Changed') {
      return super.renderToolbar();
    }

    const { diffMode, switchDiffMode } = this.props;
    const toolbarEl = super.renderToolbar();
    const onClick = mode => () => switchDiffMode(mode);
    const viewModeButtons = (
      <div className="button-group view-mode-buttons" key="buttons">
        <button
          className="inline"
          disabled={diffMode === 'inline'}
          onClick={onClick('inline')}>
          Inline
        </button>
        <button
          className="split"
          disabled={diffMode !== 'inline'}
          onClick={onClick('split')}>
          Split
        </button>
      </div>
    );
    return [viewModeButtons, toolbarEl];
  }

  renderRecordFields(path) {
    const { snapshotBefore, snapshotAfter, diffMode, pathOpened } = this.props;
    const { id } = path[path.length - 1];

    if (diffMode !== 'inline' || !snapshotAfter[id]) {
      return (
        <div className="snapshot-record-inspector">
          <div className="before record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotBefore}
              otherSnapshot={snapshotAfter}
            />
          </div>
          <div className="after record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotAfter}
              otherSnapshot={snapshotBefore}
            />
          </div>
        </div>
      );
    }

    return (
      <InlineDiffRecordFields
        path={path}
        pathOpened={pathOpened}
        snapshot={snapshotAfter}
        otherSnapshot={snapshotBefore}
      />
    );
  }

  getType = id => {
    const { snapshotBefore, snapshotAfter } = this.props;
    const record = snapshotBefore[id] || snapshotAfter[id];
    return record.__typename;
  };
}
