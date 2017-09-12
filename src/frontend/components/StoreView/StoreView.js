/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

export default class StoreView extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedRecord: null,
    };
  }

  getPlaceholderText = () => {
    return 'Store is empty';
  };

  renderTableRecord = ({ id, type }) => {
    const { selectedRecord } = this.state;
    const onClick = () => this.selectRecord(id);
    const className = selectedRecord === id ? 'selected' : '';
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
    return null;
  }

  render() {
    const { records } = this.props;
    if (!records) {
      return <div>Loading</div>;
    }

    if (!records.length) {
      return (
        <div className="placeholder">
          {this.getPlaceholderText()}
        </div>
      );
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
              {records.map(this.renderTableRecord)}
            </tbody>
          </table>
        </div>
        <div className="details">
          {this.renderDetails()}
        </div>
      </div>
    );
  }

  selectRecord(id) {
    this.setState({
      selectedRecord: id,
    });
  }
}