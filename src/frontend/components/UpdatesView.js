/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import SplitPane from 'react-split-pane';

import UpdateInspector from './UpdateInspector';

import '../css/Resizer.less';
import '../css/Tooltip.less';
import '../css/panels.less';
import '../css/UpdatesView.less';

export default class UpdatesView extends React.Component {
  constructor(props, context) {
    super(props, context);

    const {refetchEvents} = this.props;

    if (
      this.props.updatesView &&
      this.props.updatesView.events &&
      this.props.updatesView.events.length <= 0
    ) {
      refetchEvents();
    }
  }

  changeSplitType = () => {
    const splitType =
      this.props.splitType === 'vertical' ? 'horizontal' : 'vertical';

    this.props.changeSplitType(splitType);
  };

  _renderEventsTimeline() {
    const {events, selectedEvent, selectEvent, filter} = this.props;

    const filterEvents =
      events &&
      events.filter(event => {
        if (filter === '') return true;
        const name = event.operation ? event.operation.name : event.eventName;
        // debugger
        return name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    if (filterEvents.length === 0 && filter !== '')
      return <div>No search results</div>;
    return filterEvents.map((event, index) => {
      // if (event && event.operation && event.operation.name) {
      if (event && event.eventName) {
        return (
          <div
            style={{
              cursor: 'pointer',
              padding: '6px 0px 4px 6px',
              borderBottom: '#f5f5f5 solid 2px',
              color: selectedEvent === event ? '#2196f3' : 'black',
            }}
            key={index}
            onClick={() => selectEvent(event)}>
            {/* <div>{event.operation.name}</div> */}
            <div>
              {event.operation ? event.operation.name : event.eventName}
            </div>
            <div style={{opacity: 0.8, fontSize: '13px'}}>
              {event.operation ? event.eventName : ''}
            </div>
          </div>
        );
      }
      return null;
    });
  }

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
      const type = firstEvent.operation && firstEvent.operation.operationKind;
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
    const pane1Style = {};

    const pane2Style = selectedEvent ? {} : {display: 'none'};

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
        }}>
        {/* <div className="panel">
          <div className="left-panel">
            <button className="fa fa-ban" onClick={clearEvents} />
          </div>
          <div className="center-panel" />
          <div className="right-panel" />
        </div> */}

        <div className="updates-view views">
          <SplitPane
            split={splitType}
            minSize={300}
            defaultSize={400}
            pane2Style={pane2Style}
            pane1Style={pane1Style}>
            <React.Fragment>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  height: '100%',
                }}>
                {this.props.children}
                <div style={{overflowY: 'scroll', marginBottom: '33px'}}>
                  {this._renderEventsTimeline()}
                  {/* {this._renderEvents()} */}
                </div>
              </div>
            </React.Fragment>

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
