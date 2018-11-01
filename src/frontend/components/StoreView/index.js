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
import {VariableSizeList as List} from 'react-window';
import Highlighter from 'react-highlight-words';

import Filter from '../Filter';
import LatestRecordInspector from '../../containers/LatestRecordInspector';

type Props = {|
  records: {[id: string]: string},
  refetchRecords: () => void,
  matchTerm: string,
  matchType: string,
|};

type State = {|
  selectedRecordId: ?string,
|};

export default class StoreExplorer extends React.Component<Props, State> {
  state = {
    filter: '',
    selectedRecordId: null,
    // data: this.props.records ? Object.keys(this.props.records) : [],
    isTooltipActive: false,
    staleEnvId: null,
    stale: null,
  };
  listRef = React.createRef();
  itemSize = () => 40;

  // static getDerivedStateFromProps(props, state) {
  //   if (props.records && props.selectedRecordId === null) {
  //     return {
  //       selectedRecordId: Object.keys(props.records)[0],
  //       data: props.records ? Object.keys(props.records) : [],
  //     };
  //   }
  //   return null;
  //   if (props.currentEnvironment !== state.prevEnv) {
  //     return {
  //       stale: null,
  //       prevEnv: props.currentEnvironment,
  //     };
  //   }
  //   return null;
  // }

  componentDidMount() {
    const {matchTerm, matchType} = this.props;
    this.props.refetchRecords(matchTerm, matchType);
    //
    //   if (this.props.records && this.props.selectedRecordId === null) {
    //     this.setState({
    //       selectedRecordId: Object.keys(this.props.records)[0],
    //       data: this.props.records ? Object.keys(this.props.records) : [],
    //     });
    //   }
  }

  // shouldComponentUpdate(nextProps) {
  //   return nextProps.currentEnvironment !== this.props.currentEnvironment;
  // }

  // componentDidUpdate(prevProps: Props): void {
  // if (
  //   prevProps.matchTerm !== this.props.matchTerm ||
  //   prevProps.matchType !== this.props.matchType
  // ) {
  //   const {matchTerm, matchType} = this.props;
  //   this.props.refetchRecords(matchTerm, matchType);
  // }
  // if (
  //   this.props.currentTool === 'store' &&
  //   prevProps.records &&
  //   this.props.records &&
  //   prevProps.records !== this.props.records
  // ) {
  //   const difference = Object.keys(this.props.records).filter(
  //     x => !Object.keys(prevProps.records).includes(x),
  //   );
  //
  //   if (difference.length) {
  //     this.listRef.current.scrollToItem(
  //       Object.keys(this.props.records).length,
  //     );
  //   }
  // }
  // }
  // componentDidUpdate() {
  //   if (this.state.stale === null) {
  //     this.setState({stale: '-1'}, () => {
  //       const {matchTerm, matchType} = this.props;
  //       this.props.refetchRecords(matchTerm, matchType);
  //     });
  //   }
  // }

  handleChange = value => {
    // const ids = Object.keys(this.props.records);

    // const data = ids.filter(id => {
    //   return (
    //     (value !== '' &&
    //       id.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
    //     this.props.records[id].toLowerCase().indexOf(value.toLowerCase()) !==
    //       -1 ||
    //     value === ''
    //   );
    // });

    this.setState({filter: value.toLowerCase()}, () => {
      this.listRef.current.resetAfterIndex(0);
    });

    // this.setState({filter: value.toLowerCase()});
  };
  getFilteredRecords = key => {
    const value = this.props.records.byId[key];
    return (
      (this.state.filter !== '' &&
        key.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1) ||
      value.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1 ||
      this.state.filter === ''
    );
  };

  getItemData() {
    const filteredRecords = this.props.records.allIds.filter(
      this.getFilteredRecords,
    );

    return {
      filter: this.state.filter,
      selectedRecordId: this.props.selectedRecordId,
      records: this.props.records,
      recordIds: filteredRecords,
      selectRecordId: this.props.selectRecordId,
    };
  }

  render(): Element<any> {
    const {currentTool, records} = this.props;
    if (!records) {
      return <div />;
    }
    // const {itemData} = this.state;
    // if (this.state.stale === null) {
    //   return <div />;
    // }
    const containerStyle = getContainerStyle(currentTool === 'store');
    const itemData = this.getItemData();
    const itemKey = index => itemData.recordIds[index];

    return (
      <div style={containerStyle}>
        <SplitPane
          split={'vertical'}
          minSize={200}
          defaultSize={400}
          paneStyle={panelStyle}
          style={panelStyle}>
          <div style={storeViewColumnStyle}>
            <Filter placeholder="Filter" handleChange={this.handleChange} />
            {itemData.recordIds.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: '10px',
                  fontStyle: 'italic',
                  color: '#ccc',
                }}>
                No Results Found
              </div>
            )}
            <div style={storeViewColumnStyle}>
              <List
                height={1000}
                itemSize={this.itemSize}
                itemCount={itemData.recordIds.length}
                itemData={itemData}
                style={storeViewColumnStyle}
                itemKey={itemKey}
                ref={this.listRef}>
                {ListItem}
              </List>
            </div>
            <div style={recordsFooterStyle}>
              {this.state.filter && `${itemData.recordIds.length} / `}
              {this.props.records.allIds.length}
              {this.props.records.allIds.length === 1 ? ' Record' : ' Records'}
            </div>
          </div>
          <div style={storeViewColumnStyle}>
            <div style={storeViewColumnStyle}>
              {this.props.records &&
                this.props.records.allIds.length > 0 && (
                  <LatestRecordInspector />
                )}
            </div>
            <div style={recordsFooterStyle}>{this.props.selectedRecordId}</div>
          </div>
        </SplitPane>
      </div>
    );
  }
}

function ListItem({index, style, data}) {
  const {filter, records, recordIds, selectRecordId, selectedRecordId} = data;
  const onClick = () =>
    selectedRecordId !== recordIds[index] && selectRecordId(recordIds[index]);

  const tableRecordStyle = getTableRecordStyle(
    selectedRecordId === recordIds[index],
  );
  const typeStyle = getTypeStyle(selectedRecordId === recordIds[index]);

  return (
    <div
      style={{
        ...tableRecordStyle,
        ...style,
      }}
      onClick={onClick}>
      <div style={idStyle}>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={[filter]}
          autoEscape={true}
          textToHighlight={recordIds[index]}
        />
      </div>
      <div style={typeStyle}>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={[filter]}
          autoEscape={true}
          textToHighlight={records.byId[recordIds[index]]}
        />
      </div>
    </div>
  );
}

const getContainerStyle = (isVisible: boolean) => ({
  display: isVisible ? 'flex' : 'none',
  flexDirection: 'column',
  height: '100%',
});

const getTableRecordStyle = (selected: boolean) => ({
  cursor: 'pointer',
  padding: '6px',
  borderBottom: '#f5f5f5 solid 2px',
  color: selected ? 'white' : 'black',
  backgroundColor: selected ? 'rgb(29, 128, 240)' : 'white',
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

const getTypeStyle = (selected: boolean) => ({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
  opacity: selected ? 1 : 0.5,
});

const idStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
};

// const recordInspector = {
//   overflowY: 'auto',
//   flex: '2 0 70%',
//   padding: '5px',
// };

const recordsFooterStyle = {
  borderTop: '2px solid rgb(245, 245, 245)',
  padding: '8px 4px',
  textAlign: 'center',
};
