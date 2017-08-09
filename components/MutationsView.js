/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { GraphqlCodeBlock } from 'graphql-syntax-highlighter-react';
import 'graphql-syntax-highlighter-react/dist/style.css';

import SplitPane from 'react-split-pane';
import '../css/Resizer.less';

import { ObjectFields } from './RecordInspector';
import { SnapshotStoreView } from './StoreView';
import { deepObjectEqual } from '../util/objCompare';

import '../css/panels.less';
import '../css/MutationsView.less';
import '../css/Tooltip.less';

const SPLIT_TYPE_PERSIST_KEY = 'RELAY_DEVTOOLS_SPLIT_TYPE';
export default class MutationsView extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isRecording: false,
      events: null,
      selectedEvent: null,
      splitType:
        window.localStorage.getItem(SPLIT_TYPE_PERSIST_KEY) || 'vertical',
    };

    this.startOrStopRecording = this.startOrStopRecording.bind(this);
    this.clearEvents = this.clearEvents.bind(this);
    this.fetch = this.fetch.bind(this);
    this.refetch = this.refetch.bind(this);
    this.selectEvent = this.selectEvent.bind(this);
    this.changeSplitType = this.changeSplitType.bind(this);

    const { environment } = this.props;
    this.fetch({ environment });

    const { API } = context;
    API.onChange({ environment, callback: this.refetch });
  }

  componentDidMount() {
    // start recording on load
    this.startOrStopRecording();
  }

  componentWillUnmount() {
    const { isRecording } = this.state;

    // stop recording on unmount
    if (isRecording) {
      this.startOrStopRecording();
    }
  }

  fetch({ environment }) {
    const { API } = this.context;
    API.getRecordedMutationEvents({ environment }).then((events, err) => {
      if (err) {
        throw err;
      }
      if (this.state.events && events.length > this.state.events.length) {
        this.props.onNotification();
        this.setState({ events });
      }
    });
  }

  refetch() {
    this.fetch(this.props);
  }

  startOrStopRecording() {
    const newState = !this.state.isRecording;
    const { API } = this.context;

    if (newState) {
      API.startRecordingMutations(this.props);
      this.setState({ events: [], selectedEvent: null });
    } else {
      API.stopRecordingMutations(this.props);
    }

    this.setState({
      isRecording: newState,
    });
  }

  clearEvents() {
    const { isRecording } = this.state;
    this.setState({
      events: isRecording ? [] : null,
    });
  }

  selectEvent(event) {
    this.setState({
      selectedEvent: event,
    });
  }

  changeSplitType() {
    const splitType =
      this.state.splitType === 'vertical' ? 'horizontal' : 'vertical';

    this.setState({
      splitType,
    });

    window.localStorage.setItem(SPLIT_TYPE_PERSIST_KEY, splitType);
  }

  _renderEvents() {
    const { events, selectedEvent } = this.state;
    const selectedSeries = selectedEvent && selectedEvent.seriesId;
    const selectedEventName = selectedEvent && selectedEvent.eventName;

    if (events === null) {
      const button = (
        <button className="recording" onClick={this.startOrStopRecording}>
          <i className="fa fa-circle" />
        </button>
      );

      return (
        <div className="instructions">
          Press {button} to start recording mutations on the page
        </div>
      );
    }

    if (events.length === 0) {
      const { isRecording } = this.state;
      const text = isRecording
        ? 'Recording. No mutation events yet.'
        : 'Stopped. No mutation events recorded.';
      return (
        <div className="placeholder">
          {text}
        </div>
      );
    }

    const eventsByMutation = {};

    events.forEach((event, i) => {
      const { seriesId } = event;
      if (!eventsByMutation[seriesId]) {
        eventsByMutation[seriesId] = [];
      }

      const extendedEvent = Object.assign({ order: i }, event);
      eventsByMutation[seriesId].push(extendedEvent);
    });

    const mutationEls = Object.keys(eventsByMutation).map((seriesId, i) => {
      const orderedEvents = eventsByMutation[seriesId];
      const eventsEls = [];
      let lastOrdered = null;

      orderedEvents.forEach((event, j) => {
        if (lastOrdered === null) {
          eventsEls.push(
            <li key={`${i}-offset`} style={{ width: event.order * 40 }} />,
          );
        } else {
          for (let k = 0; k < event.order - lastOrdered - 1; k++) {
            const key = `${i}-${j}-${k}`;
            eventsEls.push(
              <li key={key} className="noop">
                <a>(placeholder)</a>
              </li>,
            );
          }
        }

        const key = `${i}-${j}`;
        const { eventName } = event;
        const classNames = [];
        if (event.eventName.match(/error/i)) {
          classNames.push('error');
        }
        if (seriesId === selectedSeries && eventName === selectedEventName) {
          classNames.push('selected');
        }

        function readableEventName(enumName) {
          switch (enumName) {
            case 'optimistic_update':
              return 'Optimistic Update';
            case 'optimistic_revert':
              return 'Optimistic Update Revert';
            case 'request_commit':
              return 'Request Commit';
            case 'request_error':
              return 'Request Error';
          }
        }
        eventsEls.push(
          <li
            key={key}
            data-tooltip={readableEventName(eventName)}
            onClick={() => this.selectEvent(event)}>
            <a className={classNames.join(' ')}>(placeholder)</a>
          </li>,
        );
        lastOrdered = event.order;
      });

      const firstEvent = orderedEvents[0];

      return (
        <div className="mutation-events" key={seriesId}>
          <span className="description" style={{ left: firstEvent.order * 40 }}>
            {firstEvent.mutation.node.name}
          </span>
          <ul>
            {eventsEls}
          </ul>
        </div>
      );
    });

    return (
      <div className="events-map">
        {mutationEls}
      </div>
    );
  }

  render() {
    const { isRecording, selectedEvent, splitType } = this.state;
    const recordingClassName =
      'recording fa ' +
      (isRecording ? 'fa-stop recording-active' : 'fa-circle');
    const clearSelection = () => this.selectEvent(null);
    const pane1Style = selectedEvent
      ? {}
      : { minWidth: '100%', minHeight: '100%' };
    const pane2Style = selectedEvent ? {} : { display: 'none' };

    return (
      <div className="mutations-view">
        <div className="panel">
          <div className="left-panel">
            <button
              className={recordingClassName}
              onClick={this.startOrStopRecording}
            />
            <button className="fa fa-ban" onClick={this.clearEvents} />
          </div>
          <div className="center-panel" />
          <div className="right-panel" />
        </div>
        <div className="views">
          <SplitPane
            split={splitType}
            minSize={100}
            defaultSize={400}
            pane2Style={pane2Style}
            pane1Style={pane1Style}>
            {this._renderEvents()}
            <MutationInspector
              event={selectedEvent}
              onClose={clearSelection}
              onLayoutChange={this.changeSplitType}
            />
          </SplitPane>
        </div>
      </div>
    );
  }
}

class MutationInspector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'query',
    };

    this.switchToTab = this.switchToTab.bind(this);
  }

  componentWillReceiveProps(props) {
    const { event } = props;
    const { currentTab } = this.state;
    if (event && !event.payload && currentTab === 'payload') {
      this.switchToTab('query');
    }
  }

  switchToTab(tab) {
    this.setState({
      currentTab: tab,
    });
  }

  render() {
    const { event, onClose, onLayoutChange } = this.props;
    const { currentTab } = this.state;

    if (!event) {
      return null;
    }

    const { payload } = event;

    const tabs = {
      query: 'Query',
      variables: 'Variables',
      payload: 'Payload',
      storeDiff: 'Store Diff',
    };

    // only include payload tab if it is present on the event
    const availableTabs = Object.keys(tabs).filter(
      tab => tab !== 'payload' || Boolean(event.payload),
    );

    let tabContent = null;
    if (currentTab === 'query') {
      const { node } = event.mutation;
      if (node && node.text) {
        tabContent = (
          <GraphqlCodeBlock
            className="query GraphqlCodeBlock"
            queryBody={node.text}
          />
        );
      } else if (node && node.name) {
        tabContent = (
          <div className="query name">
            {node.name}
          </div>
        );
      }
    } else if (currentTab === 'variables') {
      const { variables } = event.mutation;
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
        payloadEl = (
          <span className="error">
            {payload.message}
          </span>
        );
      } else {
        payloadEl = <ObjectFields value={payload} />;
      }
      tabContent = (
        <div className="payload">
          {payloadEl}
        </div>
      );
    }

    return (
      <div className="mutation-inspector">
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
        <div className="tab-content">
          {tabContent}
        </div>
      </div>
    );
  }
}

MutationsView.contextTypes = {
  API: PropTypes.object,
};

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
    const recordDesc = { id: record.__id, type: record.__typename };
    if (!snapshotAfter[key]) {
      removed.push(recordDesc);
    } else if (!deepObjectEqual(record, snapshotAfter[key])) {
      changed.push(recordDesc);
    }
  });

  Object.keys(snapshotAfter).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotAfter[key];
    const recordDesc = {
      id: record.__id || record.id,
      type: record.__typename,
    };
    if (!snapshotBefore[key]) {
      added.push(recordDesc);
    }
  });

  return [...added, ...removed, ...changed];
}
