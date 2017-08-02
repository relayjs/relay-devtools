/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import API from '../api';

import RecordInspector from './RecordInspector';

import '../css/StoreView.less';

export default class StoreView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRecord: null,
      records: null,
    };

    const { environment } = this.props;
    const callback = () => {
      this.fetch(this.props);
    };

    API.onChange({ environment, callback });
    this.fetch(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { environment } = this.props;

    if (environment !== nextProps.environment) {
      API.stopObservingChange({ environment });

      const callback = () => {
        this.fetch(nextProps);
      };
      API.onChange({
        environment: nextProps.environment,
        callback,
      });
    }

    this.fetch(nextProps);
  }

  fetch(props) {
    API.getRecords(props).then((res, err) => {
      if (err) {
        throw err;
      }
      this.setState({
        records: res,
      });
    });
  }

  componentWillUnmount() {
    const { environment } = this.props;
    API.stopObservingChange({ environment });
  }

  render() {
    if (!this.state.records) {
      return <div>Loading</div>;
    }

    const makeTableRecord = ({ id, type }) => {
      return (
        <tr key={id} onClick={() => this.selectRecord(id)}>
          <td>
            {id}
          </td>
          <td>
            {type}
          </td>
        </tr>
      );
    };

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
              {this.state.records.map(makeTableRecord)}
            </tbody>
          </table>
        </div>
        <div className="details">
          <RecordInspector
            id={this.state.selectedRecord}
            environment={this.props.environment}
          />
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
