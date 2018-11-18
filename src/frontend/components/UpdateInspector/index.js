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

import changedRecords from '../../util/changedRecords';
import getTabs from '../../util/getTabs';
import ObjectFields from '../RecordFields/ObjectFields';
import SnapshotStoreView from '../../containers/SnapshotStoreView';

export default class UpdateInspector extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  constructor(props) {
    super(props);

    const event = props.event;
    const currentTab = event ? Object.keys(getTabs(event))[0] : 'query';

    // $FlowFixMe
    this.state = {currentTab};
  }

  // $FlowFixMe
  componentWillReceiveProps(props) {
    const {event} = props;
    // $FlowFixMe
    const {currentTab} = this.state;
    if (event) {
      const tabs = getTabs(event);
      if (!tabs[currentTab]) {
        this.switchToTab(Object.keys(tabs)[0]);
      }
    }
  }

  // $FlowFixMe
  switchToTab = tab => {
    // $FlowFixMe
    this.setState({currentTab: tab});
  };

  render() {
    const {currentEnvironment, event, onClose, onLayoutChange} = this.props;
    // $FlowFixMe
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

      if (
        Object.keys(variables).length === 0 &&
        variables.constructor === Object
      ) {
        tabContent = <div className="variables">No Variables</div>;
      } else {
        tabContent = (
          <div className="variables">
            <ObjectFields value={variables} />
          </div>
        );
      }
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
              <a role="button" className="close" onClick={onClose}>
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
