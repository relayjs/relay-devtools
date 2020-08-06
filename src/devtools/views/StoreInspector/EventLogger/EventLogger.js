/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useState } from 'react';
import AllEventsList from './AllEventsList';
import NetworkEventDisplay from './NetworkEventDisplay';
import StoreEventDisplay from './StoreEventDisplay';
import type { LogEvent } from '../../../../types';

import styles from './EventLogger.css';

export type Props = {|
  allEvents: ?$ReadOnlyArray<LogEvent>,
  isRecording: boolean,
  checked: { [string]: boolean },
|};

function AllEventsDetails({ events, selectedEventID, setSelectedEventID }) {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  let selectedEvent = events[selectedEventID];

  if (events == null) {
    return null;
  }
  if (selectedEvent == null) {
    return (
      <div className={styles.RestoreEvent}>
        This event may have been deleted
      </div>
    );
  }

  return selectedEvent.name.startsWith('store') ? (
    <StoreEventDisplay
      selectedEvent={selectedEvent}
      selectedRecordID={selectedRecordID}
      setSelectedRecordID={setSelectedRecordID}
    />
  ) : (
    <NetworkEventDisplay selectedEvent={selectedEvent} />
  );
}

export default function EventLogger({
  allEvents,
  isRecording,
  checked,
}: Props) {
  const [selectedEventID, setSelectedEventID] = useState(0);

  if (allEvents == null && !isRecording) {
    return (
      <div className={styles.NotRecording}>
        Event Logger is not recording. To record, hit the record button on the
        top left of the tab.
      </div>
    );
  } else if (allEvents == null && isRecording) {
    return <div className={styles.NotRecording}>Loading events...</div>;
  } else if (allEvents == null) {
    return null;
  }

  return (
    <div className={styles.EventsTabContent}>
      <AllEventsList
        events={allEvents}
        selectedEventID={selectedEventID}
        setSelectedEventID={setSelectedEventID}
        checked={checked}
      />
      <AllEventsDetails
        events={allEvents}
        selectedEventID={selectedEventID}
        setSelectedEventID={setSelectedEventID}
      />
    </div>
  );
}
