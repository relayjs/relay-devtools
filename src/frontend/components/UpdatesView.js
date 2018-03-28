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

import UpdateInspector from './UpdateInspector';

import '../css/Tooltip.less';
import '../css/panels.less';
import '../css/UpdatesView.less';

export default class UpdatesView extends React.Component {
  constructor(props, context) {
    super(props, context);

    const {refetchEvents} = this.props;
    refetchEvents();
  }

  changeSplitType = () => {
    const splitType =
      this.props.splitType === 'vertical' ? 'horizontal' : 'vertical';

    this.props.changeSplitType(splitType);
  };

  _renderEvents() {
    const {events, selectedEvent, selectEvent} = this.props;
    const selectedSeries = selectedEvent && selectedEvent.seriesId;
    const selectedEventName = selectedEvent && selectedEvent.eventName;

    if (events.length === 0) {
      return (
        <div className="placeholder">
          Waiting for updates from Relay application
        </div>
      );
    }

    const eventsByRequest = {};

    events.forEach((event, i) => {
      const {seriesId} = event;
      if (!eventsByRequest[seriesId]) {
        eventsByRequest[seriesId] = [];
      }

      const extendedEvent = Object.assign({order: i}, event);
      eventsByRequest[seriesId].push(extendedEvent);
    });

    const updateEls = Object.keys(eventsByRequest).map((seriesId, i) => {
      const orderedEvents = eventsByRequest[seriesId];
      const eventsEls = [];
      let lastOrdered = null;

      orderedEvents.forEach((event, j) => {
        if (lastOrdered === null) {
          eventsEls.push(
            <li key={`${i}-offset`} style={{width: event.order * 40}} />,
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
        const {eventName} = event;
        const classNames = [];
        if (event.eventName.match(/error/i)) {
          classNames.push('error');
        }
        if (seriesId === selectedSeries && eventName === selectedEventName) {
          classNames.push('selected');
        }
        eventsEls.push(
          <li
            key={key}
            data-tooltip={eventName}
            onClick={() => selectEvent(event)}>
            <a className={classNames.join(' ')}>(placeholder)</a>
          </li>,
        );
        lastOrdered = event.order;
      });

      const firstEvent = orderedEvents[0];
      const type = firstEvent.operation && firstEvent.operation.query.operation;
      const updatesClass = ['update-events', type].filter(x => x).join(' ');

      return (
        <div className={updatesClass} key={seriesId}>
          <span className="description" style={{left: firstEvent.order * 40}}>
            {firstEvent.operation
              ? firstEvent.operation.name
              : firstEvent.eventName}
          </span>
          <ul>{eventsEls}</ul>
        </div>
      );
    });

    return <div className="events-map">{updateEls}</div>;
  }

  render() {
    const {selectedEvent, splitType, selectEvent, clearEvents} = this.props;
    const clearSelection = () => selectEvent(null);
    const pane1Style = selectedEvent
      ? {}
      : {minWidth: '100%', minHeight: '100%'};
    const pane2Style = selectedEvent ? {} : {display: 'none'};

    return (
      <div className="updates-view">
        <div className="panel">
          <div className="left-panel">
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
            <UpdateInspector
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
