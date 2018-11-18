/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import '../../css/Resizer.less';

import type {Element} from 'react';

import React from 'react';
import SplitPane from 'react-split-pane';
import {FixedSizeList as List} from 'react-window';

import SnapshotRecordInspector from '../../containers/SnapshotRecordInspector';

type Props = {|
  records: {[id: string]: string},
  refetchRecords: () => void,
  matchTerm: string,
  matchType: string,
|};

type State = {|
  selectedRecord: ?string,
|};

export default class SnapshotStoreView extends React.Component<Props, State> {
  state = {
    selectedRecord: null,
  };

  componentDidMount() {
    const {matchTerm, matchType} = this.props;
    // $FlowFixMe
    this.props.refetchRecords(matchTerm, matchType);
  }

  getPlaceholderText = () => {
    return 'No changes';
  };

  // $FlowFixMe
  renderTableRecord(id, type) {
    const {selectedRecord} = this.state;
    // $FlowFixMe
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
      <div key={id} onClick={onClick} className={className}>
        <div>{id}</div>
        <div>{type}</div>
      </div>
    );
  }

  renderDetails() {
    const {selectedRecord} = this.state;
    // $FlowFixMe
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

  render(): Element<any> {
    const {records} = this.props;
    if (!records) {
      return <div />;
    }

    const ids = Object.keys(records);
    const types = Object.values(records);
    return (
      <div style={containerStyle}>
        <SplitPane
          split={'vertical'}
          minSize={200}
          defaultSize={400}
          paneStyle={panelStyle}
          style={panelStyle}>
          <div style={storeViewColumnStyle}>
            {/* $FlowFixMe */}
            <List
              height={500}
              itemSize={40}
              itemCount={ids.length}
              style={storeViewColumnStyle}
              // $FlowFixMe
              ref={this.listRef}>
              {({index, style}) => {
                const onClick = () => this.selectRecord(ids[index]);
                const tableRecordStyle = getTableRecordStyle(
                  this.state.selectedRecord === ids[index],
                );
                return (
                  <div
                    style={{...tableRecordStyle, ...style}}
                    onClick={onClick}>
                    <div style={idStyle}>{ids[index]}</div>
                    {/* $FlowFixMe */}
                    <div style={typeStyle}>{types[index]}</div>
                  </div>
                );
              }}
            </List>
            <div style={recordsFooterStyle}>
              {ids.length}
              {ids.length === 1 ? ' Update' : ' Updates'}
            </div>
          </div>

          <div className="details" style={recordInspector}>
            {this.renderDetails()}
          </div>
        </SplitPane>
      </div>
    );
  }

  selectRecord(id: string) {
    this.setState({
      selectedRecord: id,
    });
  }
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const getTableRecordStyle = (selected: boolean) => ({
  cursor: 'pointer',
  padding: '6px',
  borderBottom: '#f5f5f5 solid 2px',
  color: selected ? '#2196f3' : 'black',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignSelf: 'center',
  boxSizing: 'border-box',
});

const panelStyle = {height: 'auto', position: 'relative'};

const storeViewColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
};

const typeStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
  opacity: 0.5,
};

const idStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
};

const recordInspector = {
  overflowY: 'auto',
  flex: '2 0 70%',
};

const recordsFooterStyle = {
  borderTop: '2px solid rgb(245, 245, 245)',
  padding: '8px 4px',
  textAlign: 'center',
};
