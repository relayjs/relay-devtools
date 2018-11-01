/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

'use strict';

import '../../css/UpdatesView.less';

import React from 'react';
import {GraphqlCodeBlock} from 'graphql-syntax-highlighter-react';

import {deepObjectEqual} from '../../util/objCompare';
import ObjectFields from '../RecordFields/ObjectFields';
import SnapshotStoreView from '../../containers/SnapshotStoreView';

export default class UpdateInspector extends React.Component<$FlowFixMe> {
  constructor(props) {
    super(props);

    const event = props.event;
    const currentTab = event ? Object.keys(getTabs(event))[0] : 'query';

    this.state = {currentTab};

    this.switchToTab = this.switchToTab.bind(this);
  }

  componentWillReceiveProps(props) {
    const {event} = props;
    const {currentTab} = this.state;
    if (event) {
      const tabs = getTabs(event);
      if (!tabs[currentTab]) {
        this.switchToTab(Object.keys(tabs)[0]);
      }
    }
  }

  switchToTab(tab) {
    this.setState({currentTab: tab});
  }

  render() {
    const {currentEnvironment, event, onClose, onLayoutChange} = this.props;
    const {currentTab} = this.state;

    if (!event || event.environment.toString() !== currentEnvironment) {
      return null;
    }

    const {response} = event;

    const tabs = getTabs(event);

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
      const {snapshotBefore, snapshotAfter} = event;
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
    } else if (currentTab === 'response') {
      let responseEl = null;

      if (response.isError) {
        responseEl = <span className="error">{response.message}</span>;
      } else {
        responseEl = <ObjectFields value={response} />;
      }
      tabContent = <div className="response">{responseEl}</div>;
    }

    return (
      <div className="updates-view">
        <div className="update-inspector">
          <div className="tab-panel">
            <span className="left-buttons">
              <a className="close" onClick={onClose}>
                &times;
              </a>
            </span>
            {Object.keys(tabs).map(tabId => {
              const onClick = () => this.switchToTab(tabId);
              const classes = 'tab' + (currentTab === tabId ? ' active' : '');
              const tabName =
                tabId === 'response' && response.isError
                  ? 'Error'
                  : tabs[tabId];
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
            </span>
          </div>
          <div className="tab-content">{tabContent}</div>
        </div>
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

  // Only include storeDiff tab if it is present on the event.
  if (event.snapshotAfter) {
    tabs.storeDiff = 'Store Update';
  }

  // Only include response tab if it is present on the event.
  if (event.response) {
    tabs.response = 'Response';
  }

  return tabs;
}

// Return only records affected by the change in the following order:
// - added records
// - removed records
// - changed records
function changedRecords(snapshotBefore, snapshotAfter) {
  const added = {};
  const removed = {};
  const changed = {};

  Object.keys(snapshotBefore).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotBefore[key];
    if (record) {
      if (!snapshotAfter[key]) {
        removed[record.__id] = record.__typename;
      } else if (!deepObjectEqual(record, snapshotAfter[key])) {
        changed[record.__id] = record.__typename;
      }
    }
  });

  Object.keys(snapshotAfter).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotAfter[key];
    if (record) {
      if (!snapshotBefore[key]) {
        added[record.__id] = record.__typename;
      }
    }
  });

  return {...added, ...removed, ...changed};
}
