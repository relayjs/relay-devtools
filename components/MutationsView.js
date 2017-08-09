/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import API from '../api';

import { GraphqlCodeBlock } from 'graphql-syntax-highlighter-react';
import 'graphql-syntax-highlighter-react/dist/style.css';

import { ObjectFields } from './RecordInspector';
import { SnapshotStoreView } from './StoreView';
import { deepObjectEqual } from '../util/objCompare';

import '../css/panels.less';
import '../css/MutationsView.less';
import '../css/Tooltip.less';

export default class MutationsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRecording: false,
      events: null,
      selectedEvent: null,
    };

    this.startOrStopRecording = this.startOrStopRecording.bind(this);
    this.clearEvents = this.clearEvents.bind(this);
    this.fetch = this.fetch.bind(this);
    this.refetch = this.refetch.bind(this);
    this.selectEvent = this.selectEvent.bind(this);

    const { environment } = this.props;
    this.fetch({ environment });

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
      const eventsEls = [];
      let lastOrdered = null;

      eventsByMutation[seriesId].forEach((event, j) => {
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

      return (
        <div className="mutation-events" key={seriesId}>
          <span className="description" style={{ left: events[0].order * 40 }}>
            {events[0].mutation.node.name}
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
    const { isRecording, selectedEvent } = this.state;
    const recordingClassName =
      'recording fa ' +
      (isRecording ? 'fa-stop recording-active' : 'fa-circle');
    const clearSelection = () => this.selectEvent(null);

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
          {this._renderEvents()}
          <MutationInspector event={selectedEvent} onClose={clearSelection} />
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
    const { event, onClose } = this.props;
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
          <a className="close" onClick={onClose}>
            &times;
          </a>
        </div>
        <div className="tab-content">
          {tabContent}
        </div>
      </div>
    );
  }
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
