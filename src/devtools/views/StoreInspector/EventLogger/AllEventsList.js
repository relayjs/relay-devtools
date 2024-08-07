/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { LogEvent } from '../../../../types';

import styles from './EventLogger.css';

export type Props = {|
  events: $ReadOnlyArray<LogEvent>,
  selectedEventID: number,
  setSelectedEventID: number => void,
  checked: { [string]: boolean },
|};

const networkEventNames = [
  'network.start',
  'network.info',
  'network.next',
  'network.error',
  'network.complete',
  'network.unsubscribe',
];

function eventsAreLinked(
  events: any | $ReadOnlyArray<LogEvent>,
  selectedEventID: any | number,
  index: any | number
) {
  const currentEvent = events[index];
  const selectedEvent = events[selectedEventID];
  return (
    currentEvent != null &&
    selectedEvent != null &&
    networkEventNames.includes(currentEvent.name) &&
    networkEventNames.includes(selectedEvent.name) &&
    currentEvent.transactionID != null &&
    selectedEvent.transactionID != null &&
    selectedEvent.transactionID === currentEvent.transactionID
  );
}

function appearsInObject(searchText: string, obj: Object): boolean {
  if (obj == null) {
    return false;
  }
  for (const key in obj) {
    if (typeof obj[key] == 'object' && obj[key] !== null) {
      const appears: boolean = appearsInObject(searchText, obj[key]);
      if (appears) {
        return appears;
      }
    } else if (
      (obj[key] !== null &&
        obj[key]
          .toString()
          .toLowerCase()
          .includes(searchText)) ||
      key
        .toString()
        .toLowerCase()
        .includes(searchText)
    ) {
      return true;
    }
  }
  return false;
}

function StoreEventDisplay({
  displayText,
  index,
  setSelectedEventID,
  selectedEventID,
  events,
}: {|
  displayText: string,
  events: $ReadOnlyArray<LogEvent>,
  index: number,
  selectedEventID: number,
  setSelectedEventID: number => void,
|}) {
  return (
    <div
      key={index}
      onClick={() => {
        setSelectedEventID(index);
      }}
      className={`${styles.Record} ${
        index === selectedEventID
          ? styles.SelectedRecord
          : eventsAreLinked(events, selectedEventID, index)
          ? styles.RelatedRecord
          : ''
      }`}
    >
      {displayText}
    </div>
  );
}

export default function AllEventsList({
  events,
  selectedEventID,
  setSelectedEventID,
  checked,
}: Props): React$MixedElement {
  const [eventSearch, setEventSearch] = useState('');
  const fetchSearchBarText = useCallback((e: any) => {
    setEventSearch(e.target.value);
  }, []);

  let eventsArrayDisplay = events.map((event, index) => {
    let displayText = '';

    if (!checked['networkEvents'] && !checked['storeEvents']) {
      return null;
    } else if (
      checked['networkEvents'] &&
      !checked['storeEvents'] &&
      event.name.toLowerCase().includes('store')
    ) {
      return null;
    } else if (
      checked['storeEvents'] &&
      !checked['networkEvents'] &&
      (event.name.toLowerCase().includes('network') ||
        event.name.toLowerCase().includes('query'))
    ) {
      return null;
    }

    switch (event.name) {
      case 'store.publish':
        return event.optimistic ? (
          <StoreEventDisplay
            displayText="Store Optimistic Update"
            key={index}
            index={index}
            setSelectedEventID={setSelectedEventID}
            selectedEventID={selectedEventID}
            events={events}
          />
        ) : (
          <StoreEventDisplay
            displayText="Store Publish"
            key={index}
            index={index}
            setSelectedEventID={setSelectedEventID}
            selectedEventID={selectedEventID}
            events={events}
          />
        );
      case 'store.gc':
        displayText = 'Store GC';
        break;
      case 'store.restore':
        displayText = 'Store Restore';
        break;
      case 'store.snapshot':
        displayText = 'Store Snapshot';
        break;
      case 'store.notify.start':
        displayText = 'Notify Start';
        break;
      case 'store.notify.complete':
        displayText = 'Notify Complete';
        break;
      case 'queryresource.fetch':
        displayText = 'QueryResource Fetch';
        break;
      case 'network.start':
        displayText = 'Network Start';
        break;
      case 'network.info':
        displayText = 'Network Info';
        break;
      case 'network.next':
        displayText = 'Network Next';
        break;
      case 'network.complete':
        displayText = 'Network Complete';
        break;
      case 'network.unsubscribe':
        displayText = 'Network Unsubscribe';
        break;
      case 'network.error':
        displayText = 'Network Error';
        break;
      default:
        return null;
    }
    return (
      <StoreEventDisplay
        displayText={displayText}
        key={index}
        index={index}
        setSelectedEventID={setSelectedEventID}
        selectedEventID={selectedEventID}
        events={events}
      />
    );
  });

  eventsArrayDisplay = useMemo(
    () =>
      eventsArrayDisplay.filter(
        (event, index) =>
          eventSearch === '' ||
          eventSearch
            .trim()
            .split(' ')
            .some(
              (search: any) =>
                (event != null &&
                  String((event: $FlowFixMe).props.displayText)
                    .toLowerCase()
                    .includes(search.toLowerCase())) ||
                (events[index] != null &&
                  appearsInObject(search.toLowerCase(), events[index]))
            )
      ),
    [eventsArrayDisplay, eventSearch, events]
  );

  return (
    <div className={styles.AllEventsList}>
      <input
        className={styles.EventsSearchBar}
        type="text"
        onChange={fetchSearchBarText}
        placeholder="Search"
      ></input>
      <div>
        {eventsArrayDisplay.length <= 0 && eventSearch !== '' ? (
          <p className={styles.RecordNotFound}>
            Sorry, no events with the name '{eventSearch}' were found!
          </p>
        ) : (
          eventsArrayDisplay
        )}
      </div>
    </div>
  );
}
