/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

'use strict';

import '../../css/Resizer.less';
import '../../css/UpdatesView.less';
import '../../css/Tooltip.less';

import type {Element} from 'react';

import React from 'react';
import SplitPane from 'react-split-pane';
import {VariableSizeList as List} from 'react-window';
import Highlighter from 'react-highlight-words';

import Filter from '../Filter';
import UpdateInspector from '../UpdateInspector';

export default class UpdatesView extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  state = {
    filter: '',
    idLength: 0,
    data:
      this.props.events && Array.isArray(this.props.events)
        ? this.props.events
        : [],
  };
  listRef = React.createRef<List<any>>();
  itemSize = () => 40;
  // $FlowFixMe
  itemKey = index => index;
  // $FlowFixMe
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    this.props.refetchEvents();
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

    return (
      <div className="updates-view">
        <div className="events-map">{updateEls}</div>
      </div>
    );
  }

  _renderEventsTimeline() {
    const {events, selectedEvent, selectEvent, currentEnvironment} = this.props;
    const filter = '';
    const filterEvents =
      events &&
      events.length > 0 &&
      events.filter(event => {
        if (event.environment.toString() !== currentEnvironment) {
          return false;
        }
        if (filter === '') {
          return true;
        }
        const name = event.operation ? event.operation.name : event.eventName;
        // debugger
        return name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    if (filterEvents && filterEvents.length === 0 && filter !== '') {
      return <div>No search results</div>;
    } else if (
      !Array.isArray(filterEvents) ||
      (Array.isArray(filterEvents) && filterEvents.length === 0) ||
      !filterEvents
    ) {
      return <div>No search results</div>;
    }

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

  // $FlowFixMe
  handleChange = value => {
    // $FlowFixMe
    this.setState({filter: value.toLowerCase()}, () => {
      // $FlowFixMe
      this.props.viewType === 'list' && this.listRef.current.resetAfterIndex(0);
    });
  };

  // $FlowFixMe
  getFilteredEvents = event => {
    const name =
      event && event.operation ? event.operation.name : event.eventName;
    const operation = event.operation ? event.eventName : '';
    return (
      // $FlowFixMe
      (this.state.filter !== '' &&
        // $FlowFixMe
        name.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1) ||
      // $FlowFixMe
      operation.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1 ||
      // $FlowFixMe
      this.state.filter === ''
    );
  };
  getItemData() {
    const filteredEvents = this.props.events.filter(this.getFilteredEvents);

    return {
      // $FlowFixMe
      filter: this.state.filter,
      selectEvent: this.props.selectEvent,
      events: this.props.events,
      filteredEvents,
      selectedEvent: this.props.selectedEvent,
    };
  }
  render(): Element<any> {
    const {
      currentEnvironment,
      currentTool,
      events,
      selectedEvent,
      splitType,
      selectEvent,
    } = this.props;
    if (!events) {
      return <div />;
    }

    const clearSelection = () => selectEvent(null);
    const containerStyle = getContainerStyle(currentTool === 'updates');
    // const pane1Style = this.props.selectedEvent
    //   ? {height: 'auto', position: 'relative'}
    //   : {minWidth: '100%', flex: 1, height: 'auto', position: 'relative'};
    // const pane2Style = selectedEvent ? {} : {display: 'none'};
    const listContainerStyle = getListContainerStyle(Boolean(selectedEvent));
    const itemData = this.getItemData();
    const itemKey = index => index;

    return (
      <div style={containerStyle}>
        <SplitPane
          split={splitType}
          minSize={200}
          defaultSize={400}
          paneStyle={panelStyle}
          style={panelStyle}>
          <div style={storeViewColumnStyle}>
            <Filter placeholder="Filter" handleChange={this.handleChange} />
            {itemData.filteredEvents.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: '10px',
                  fontStyle: 'italic',
                  color: '#ccc',
                }}>
                No Results Found
              </div>
            )}
            <div style={listContainerStyle}>
              {this.props.viewType === 'list' ? (
                // $FlowFixMe
                <List
                  height={1000}
                  itemSize={this.itemSize}
                  itemCount={itemData.filteredEvents.length}
                  itemData={itemData}
                  style={storeViewColumnStyle}
                  itemKey={itemKey}
                  ref={this.listRef}>
                  {ListItem}
                </List>
              ) : (
                itemData.filteredEvents &&
                itemData.filteredEvents.length > 0 &&
                this._renderEvents()
              )}
            </div>

            <div style={recordsFooterStyle}>
              {// $FlowFixMe
              this.state.filter && `${itemData.filteredEvents.length} / `}
              {this.props.events.length}
              {itemData.filteredEvents.length === 1 ? ' Event' : ' Events'}
            </div>
          </div>
          {this.props.selectedEvent ? (
            <div style={recordInspector}>
              {this.props.events && this.props.events.length > 0 && (
                <UpdateInspector
                  event={selectedEvent}
                  onClose={clearSelection}
                  onLayoutChange={this.changeSplitType}
                  currentEnvironment={currentEnvironment}
                />
              )}
            </div>
          ) : (
            <div />
          )}
        </SplitPane>
      </div>
    );
  }
}

function ListItem({index, style, data}) {
  const {filter, filteredEvents, selectEvent, selectedEvent} = data;
  const event = filteredEvents[index];
  const onClick = () => selectEvent(event);

  const tableRecordStyle = getTableRecordStyle(selectedEvent === event);
  const typeStyle = getTypeStyle(selectedEvent === event);

  return (
    <div
      style={{
        ...tableRecordStyle,
        ...style,
      }}
      onClick={onClick}>
      <div style={idStyle}>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={[filter]}
          autoEscape={true}
          textToHighlight={
            event.operation ? event.operation.name : event.eventName
          }
        />
      </div>
      <div style={typeStyle}>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={[filter]}
          autoEscape={true}
          textToHighlight={event.operation ? event.eventName : ''}
        />
      </div>
    </div>
  );
}

const getContainerStyle = (isVisible: boolean) => ({
  display: isVisible ? 'flex' : 'none',
  flexDirection: 'column',
  height: '100%',
});

const getTypeStyle = (selected: boolean) => ({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
  opacity: selected ? 1 : 0.5,
});

const recordInspector = {
  overflowY: 'auto',
  flex: '2 0 70%',
};

const getTableRecordStyle = (selected: boolean) => ({
  cursor: 'pointer',
  padding: '6px',
  borderBottom: '#f5f5f5 solid 2px',
  color: selected ? '#2196f3' : 'black',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignSelf: 'center',
  boxSizing: 'border-box',
});

const getListContainerStyle = (isSelectedEvent: boolean) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  // width: isSelectedEvent ? '100%' : '50%',
  // height: '100%',
});

const panelStyle = {height: 'auto', position: 'relative'};

const storeViewColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
};

const typeStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
  opacity: 0.5,
};

const idStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: '200px',
};

const recordsFooterStyle = {
  borderTop: '2px solid rgb(245, 245, 245)',
  padding: '8px 4px',
  textAlign: 'center',
};

const newNotificationsStyle = {
  border: '2px solid blue',
  borderRadius: '50%',
  background: 'blue',
  height: '5px',
  width: '5px',
  display: 'inline-block',
};
