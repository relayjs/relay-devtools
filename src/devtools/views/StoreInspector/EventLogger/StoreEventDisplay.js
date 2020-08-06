/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useState } from 'react';
import RecordList from '../RecordList';
import TabBar from '../StoreTabBar';
import RecordDetails from '../RecordDetails';
import type { LogEvent } from '../../../../types';

import styles from './EventLogger.css';

export type TabID =
  | 'explorer'
  | 'snapshot'
  | 'optimistic'
  | 'recorder'
  | 'invalidRecords'
  | 'updatedRecords';
export type TabInfo = {|
  id: string,
  label: string,
  title?: string,
|};

const invalidatedRecordsTab = {
  id: ('invalidRecords': TabID),
  label: 'Invalidated Records Notify',
  title: 'Relay Event Logger: Invalidated Records',
};
const updatedRecordsTab = {
  id: ('updatedRecords': TabID),
  label: 'Updated Records Notify',
  title: 'Relay Event Logger: Updated Records',
};

const notifyCompleteTabs = [invalidatedRecordsTab, updatedRecordsTab];

export default function StoreEventDisplay(props: {|
  selectedEvent: LogEvent,
  selectedRecordID: string,
  setSelectedRecordID: string => void,
|}) {
  let { selectedEvent, selectedRecordID, setSelectedRecordID } = props;
  const [tab, setTab] = useState(updatedRecordsTab);
  if (selectedEvent.name === 'store.publish') {
    let recordsByType = new Map();
    let records = selectedEvent.source;
    if (records != null) {
      for (let key in records) {
        let rec = records[key];
        if (rec != null) {
          let arr = recordsByType.get(rec.__typename);
          if (arr) {
            arr.push(key);
          } else {
            recordsByType.set(rec.__typename, [key]);
          }
        }
      }
    }
    let selectedRecord = selectedEvent.source[selectedRecordID];
    let displayText = 'The following records have been published to the store:';
    if (selectedEvent.optimistic) {
      displayText =
        'The following records are part of an optimistic update to the store:';
    }

    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>{displayText}</div>
        <div className={styles.RecordsTabContent}>
          <RecordList
            records={records}
            recordsByType={recordsByType}
            selectedRecordID={selectedRecordID}
            setSelectedRecordID={setSelectedRecordID}
          />
          <RecordDetails
            records={records}
            setSelectedRecordID={setSelectedRecordID}
            selectedRecord={selectedRecord}
          />
        </div>
      </div>
    );
  } else if (selectedEvent.name === 'store.gc') {
    let records = {};
    selectedEvent.references
      .filter(ref => selectedEvent.gcRecords[ref] != null)
      .map(ref => (records[ref] = selectedEvent.gcRecords[ref]));

    let recordsByType = new Map();

    if (records != null) {
      for (let key in records) {
        let rec = records[key];
        if (rec != null) {
          let arr = recordsByType.get(rec.__typename);
          if (arr) {
            arr.push(key);
          } else {
            recordsByType.set(rec.__typename, [key]);
          }
        }
      }
    }
    let selectedRecord = records[selectedRecordID];

    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          The following records have been garbage collected:
        </div>
        <div className={styles.RecordsTabContent}>
          <RecordList
            records={records}
            recordsByType={recordsByType}
            selectedRecordID={selectedRecordID}
            setSelectedRecordID={setSelectedRecordID}
          />
          <RecordDetails
            records={records}
            setSelectedRecordID={setSelectedRecordID}
            selectedRecord={selectedRecord}
          />
        </div>
      </div>
    );
  } else if (selectedEvent.name === 'store.restore') {
    return (
      <div className={styles.RestoreEvent}>
        All optimistic updates have been restored
      </div>
    );
  } else if (selectedEvent.name === 'store.snapshot') {
    return (
      <div className={styles.RestoreEvent}>
        A snapshot was taken in the Relay runtime store.
      </div>
    );
  } else if (selectedEvent.name === 'store.notify.start') {
    return (
      <div className={styles.RestoreEvent}>
        A notification was sent to the store, signaling an update.
      </div>
    );
  } else if (selectedEvent.name === 'store.notify.complete') {
    let records = {};
    let invalidRecs = {};
    let recordsByType = new Map();
    let invalidatedRecordsByType = new Map();
    let selectedRecord = null;
    let invalidatedSelectedRecord = null;

    if (tab === updatedRecordsTab) {
      Object.keys(selectedEvent.updatedRecordIDs)
        .filter(ref => selectedEvent.updatedRecordIDs[ref] === true)
        .forEach(ref => {
          records[ref] = selectedEvent.updatedRecords[ref];
        });

      if (records != null) {
        for (let key in records) {
          let rec = records[key];
          if (rec != null) {
            let arr = recordsByType.get(rec.__typename);
            if (arr) {
              arr.push(key);
            } else {
              recordsByType.set(rec.__typename, [key]);
            }
          } else {
            let arr = recordsByType.get(rec['DeletedRecords']);
            if (arr) {
              arr.push(key);
            } else {
              recordsByType.set('DeletedRecords', [key]);
            }
          }
        }
      }
      selectedRecord = records[selectedRecordID];
    } else if (tab === invalidatedRecordsTab) {
      if (selectedEvent.invalidatedRecords != null) {
        for (let key in selectedEvent.invalidatedRecords) {
          let rec = selectedEvent.invalidatedRecords[key];
          if (rec != null) {
            let arr = invalidatedRecordsByType.get(rec.__typename);
            if (arr) {
              arr.push(key);
            } else {
              invalidatedRecordsByType.set(rec.__typename, [key]);
            }
          }
        }
      }
      invalidatedSelectedRecord =
        selectedEvent.invalidatedRecords[selectedRecordID];
    }

    return (
      <div className={styles.NotifyComplete}>
        <div className={styles.TabBar}>
          <div className={styles.Spacer} />
          <TabBar
            tabID={tab.id}
            id="StoreTab"
            selectTab={setTab}
            size="small"
            tabs={notifyCompleteTabs}
          />
        </div>
        {tab === updatedRecordsTab && (
          <div className={styles.gcEvent}>
            <div className={styles.gcExplained}>
              Subscribers are notified for the following record changes:
            </div>
            <div className={styles.RecordsTabContent}>
              <RecordList
                records={records}
                recordsByType={recordsByType}
                selectedRecordID={selectedRecordID}
                setSelectedRecordID={setSelectedRecordID}
              />
              <RecordDetails
                records={records}
                setSelectedRecordID={setSelectedRecordID}
                selectedRecord={selectedRecord}
              />
            </div>
          </div>
        )}
        {tab === invalidatedRecordsTab && (
          <div className={styles.gcEvent}>
            <div className={styles.gcExplained}>
              The notification to the store has been received and the following
              records are now invalidated!
            </div>
            <div className={styles.RecordsTabContent}>
              <RecordList
                records={invalidRecs}
                recordsByType={invalidatedRecordsByType}
                selectedRecordID={selectedRecordID}
                setSelectedRecordID={setSelectedRecordID}
              />
              <RecordDetails
                records={invalidRecs}
                setSelectedRecordID={setSelectedRecordID}
                selectedRecord={invalidatedSelectedRecord}
              />
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return null;
  }
}
