/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React from 'react';

import type {Element} from 'react';

type Props = {|
  records: {[id: string]: string},
  refetchRecords: () => void,
  matchTerm: string,
  matchType: string,
|};

type State = {|
  selectedRecord: ?string,
|};

export default class StoreView extends React.Component<Props, State> {
  state = {
    selectedRecord: null,
  };

  getPlaceholderText = () => {
    return 'Store is empty';
  };

  renderTableRecord(id: string, type: string) {
    const {selectedRecord} = this.state;
    const onClick = () => this.selectRecord(id);
    const className = selectedRecord === id ? 'selected' : '';
    return (
      <tr key={id} onClick={onClick} className={className}>
        <td>{id}</td>
        <td>{type}</td>
      </tr>
    );
  }

  renderDetails(): ?Element<any> {
    return null;
  }

  render(): Element<any> {
    const {records} = this.props;
    if (!records) {
      return <div>Loading</div>;
    }

    const ids = Object.keys(records);

    if (!ids.length) {
      return <div className="placeholder">{this.getPlaceholderText()}</div>;
    }

    return (
      <div className="store-view">
        <div className="records-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {ids.map(id => this.renderTableRecord(id, records[id]))}
            </tbody>
          </table>
        </div>
        <div className="details">{this.renderDetails()}</div>
      </div>
    );
  }

  selectRecord(id: string) {
    this.setState({
      selectedRecord: id,
    });
  }
}
