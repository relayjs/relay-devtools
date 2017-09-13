/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import { GraphqlCodeBlock } from 'graphql-syntax-highlighter-react';
import 'graphql-syntax-highlighter-react/dist/style.css';

import { deepObjectEqual } from '../util/objCompare';
import { ObjectFields } from './RecordInspector';
import { SnapshotStoreView } from './StoreView';

export default class UpdateInspector extends React.Component {
  constructor(props) {
    super(props);

    const event = props.event;
    const currentTab = event ? Object.keys(getTabs(event))[0] : 'query';

    this.state = { currentTab };

    this.switchToTab = this.switchToTab.bind(this);
  }

  componentWillReceiveProps(props) {
    const { event } = props;
    const { currentTab } = this.state;
    if (event) {
      const tabs = getTabs(event);
      if (!tabs[currentTab]) {
        this.switchToTab(Object.keys(tabs)[0]);
      }
    }
  }

  switchToTab(tab) {
    this.setState({ currentTab: tab });
  }

  render() {
    const { event, onClose, onLayoutChange } = this.props;
    const { currentTab } = this.state;

    if (!event) {
      return null;
    }

    const { payload } = event;

    const tabs = getTabs(event);

    // only include payload tab if it is present on the event
    const availableTabs = Object.keys(tabs).filter(
      tab => tab !== 'payload' || Boolean(event.payload),
    );

    let tabContent = null;
    if (currentTab === 'query') {
      const node = event.operation;
      if (node && node.text) {
        tabContent = (
          <GraphqlCodeBlock
            className="query GraphqlCodeBlock"
            queryBody={node.text}
          />
        );
      } else if (node && node.name) {
        tabContent = <div className="query name">{node.name}</div>;
      }
    } else if (currentTab === 'variables') {
      const variables = event.variables;
      tabContent = (
        <div className="variables">
          <ObjectFields value={variables} />
        </div>
      );
    } else if (currentTab === 'storeDiff') {
      const { snapshotBefore, snapshotAfter } = event;
      const records = changedRecords(snapshotBefore, snapshotAfter);

      tabContent = (
        <div className="store-diff">
          <SnapshotStoreView
            records={records}
            snapshotBefore={snapshotBefore}
            snapshotAfter={snapshotAfter}
          />
        </div>
      );
    } else if (currentTab === 'payload') {
      let payloadEl = null;

      if (payload.isError) {
        payloadEl = <span className="error">{payload.message}</span>;
      } else {
        payloadEl = <ObjectFields value={payload} />;
      }
      tabContent = <div className="payload">{payloadEl}</div>;
    }

    return (
      <div className="update-inspector">
        <div className="tab-panel">
          {availableTabs.map(tabId => {
            const onClick = () => this.switchToTab(tabId);
            const classes = 'tab' + (currentTab === tabId ? ' active' : '');
            const tabName =
              tabId === 'payload' && payload.isError ? 'Error' : tabs[tabId];
            return (
              <a key={tabId} className={classes} onClick={onClick}>
                {tabName}
              </a>
            );
          })}
          <span className="right-buttons">
            <a className="change-layout" onClick={onLayoutChange}>
              <i className="fa fa-columns" />
            </a>
            <a className="close" onClick={onClose}>
              &times;
            </a>
          </span>
        </div>
        <div className="tab-content">{tabContent}</div>
      </div>
    );
  }
}

function getTabs(event) {
  const tabs = {};

  // Only include query & variables tabs for a network operation.
  if (event.operation) {
    tabs.query = 'Query';
    tabs.variables = 'Variables';
  }

  // Only include payload tab if it is present on the event.
  if (event.payload) {
    tabs.payload = 'Payload';
  }

  // Only include storeDiff tab if it is present on the event.
  if (event.snapshotAfter) {
    tabs.storeDiff = 'Store Update';
  }

  return tabs;
}

// Return only records affected by the change in the following order:
// - added records
// - removed records
// - changed records
function changedRecords(snapshotBefore, snapshotAfter) {
  const added = [];
  const removed = [];
  const changed = [];

  Object.keys(snapshotBefore).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotBefore[key];
    if (record) {
      const recordDesc = { id: record.__id, type: record.__typename };
      if (!snapshotAfter[key]) {
        removed.push(recordDesc);
      } else if (!deepObjectEqual(record, snapshotAfter[key])) {
        changed.push(recordDesc);
      }
    }
  });

  Object.keys(snapshotAfter).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotAfter[key];
    if (record) {
      const recordDesc = {
        id: record.__id || record.id,
        type: record.__typename,
      };
      if (!snapshotBefore[key]) {
        added.push(recordDesc);
      }
    }
  });

  return [...added, ...removed, ...changed];
}
