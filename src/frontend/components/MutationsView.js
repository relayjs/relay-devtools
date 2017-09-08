/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

import SplitPane from 'react-split-pane';
import '../css/Resizer.less';

import MutationInspector from './MutationInspector';

import '../css/Tooltip.less';
import '../css/panels.less';
import '../css/MutationsView.less';

export default class MutationsView extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { refetchEvents } = this.props;
    refetchEvents();
  }

  componentDidMount() {
    // start recording on load
    this.props.startRecordingEvents();
  }

  componentWillUnmount() {
    const { isRecording } = this.props;

    // stop recording on unmount
    if (isRecording) {
      this.stopRecordingEvents();
    }
  }

  startOrStopRecording = () => {
    const {
      isRecording,
      startRecordingEvents,
      stopRecordingEvents,
    } = this.props;
    const newState = !isRecording;

    if (newState) {
      startRecordingEvents();
    } else {
      stopRecordingEvents();
    }
  };

  changeSplitType = () => {
    const splitType =
      this.props.splitType === 'vertical' ? 'horizontal' : 'vertical';

    this.props.changeSplitType(splitType);
  };

  _renderEvents() {
    const { events, selectedEvent, selectEvent } = this.props;
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
      const { isRecording } = this.props;
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
            onClick={() => selectEvent(event)}>
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
    const {
      isRecording,
      selectedEvent,
      splitType,
      selectEvent,
      clearEvents,
    } = this.props;
    const recordingClassName =
      'recording fa ' +
      (isRecording ? 'fa-stop recording-active' : 'fa-circle');
    const clearSelection = () => selectEvent(null);
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
            <button className="fa fa-ban" onClick={clearEvents} />
          </div>
          <div className="center-panel" />
          <div className="right-panel" />
        </div>
        <div className="views">
          <SplitPane
            split={splitType}
            minSize={200}
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
