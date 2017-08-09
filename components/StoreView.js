/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import PropTypes from 'prop-types';

import RecordInspector, { SnapshotRecordInspector } from './RecordInspector';

import '../css/StoreView.less';

export class StoreView extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedRecord: null,
      records: props.records || null,
    };

    this.renderTableRecord = this.renderTableRecord.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.records) {
      this.setState({
        records: props.records,
      });
    }
  }

  getPlaceholderText() {
    return 'Store is empty';
  }

  renderTableRecord({ id, type }) {
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
  }

  renderDetails() {
    const { selectedRecord } = this.state;
    const { environment } = this.props;
    return <RecordInspector id={selectedRecord} environment={environment} />;
  }

  render() {
    const { records } = this.state;
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

// StoreView connected to the API fetching the latest records
export default class LatestStoreView extends StoreView {
  constructor(props, context) {
    super(props, context);

    const { environment } = this.props;
    const callback = () => {
      this.fetch(this.props);
    };

    const { API } = context;
    API.onChange({ environment, callback });
    this.fetch(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { environment } = this.props;
    const { API } = this.context;

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
    const { API } = this.context;
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
    const { API } = this.context;
    API.stopObservingChange({ environment });
  }
}

LatestStoreView.contextTypes = {
  API: PropTypes.object,
};

export class SnapshotStoreView extends StoreView {
  renderTableRecord({ id, type }) {
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
  }

  renderDetails() {
    const { selectedRecord } = this.state;
    const { environment, snapshotBefore, snapshotAfter } = this.props;
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
          environment={environment}
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
