/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BridgeContext, StoreContext } from '../context';
import InspectedElementTree from '../Components/InspectedElementTree';
import InspectedElementTreeStoreInspector from './InspectedElementTreeStoreInspector';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import { copy } from 'clipboard-js';
import { serializeDataForCopy } from '../utils';
import TabBar from './StoreTabBar';
import RecordingImportExportButtons from './RecordingImportExportButtons';

import styles from './StoreInspector.css';

type RequestStatus = 'active' | 'unsubscribed' | 'completed' | 'error';
type RequestEntry = {|
  +id: number,
  params: any,
  variables: { [string]: mixed },
  status: RequestStatus,
  responses: Array<mixed>,
  infos: Array<mixed>,
|};

export type TabID =
  | 'explorer'
  | 'snapshot'
  | 'optimistic'
  | 'profiler'
  | 'invalidRecords'
  | 'updatedRecords';
export type TabInfo = {|
  id: string,
  label: string,
  title?: string,
|};

const snapshotTab = {
  id: ('snapshot': TabID),
  label: 'Snapshot',
  title: 'Relay Snapshot',
};
const explorerTab = {
  id: ('explorer': TabID),
  label: 'Store Explorer',
  title: 'Relay Store Explorer',
};
const optimisticTab = {
  id: ('optimistic': TabID),
  label: 'Optimistic Updates',
  title: 'Relay Optimistic Updates',
};
const profilerTab = {
  id: ('profiler': TabID),
  label: 'Store Profiler',
  title: 'Relay Store Profiler',
};
const invalidatedRecordsTab = {
  id: ('invalidRecords': TabID),
  label: 'Invalidated Records Notify',
  title: 'Relay Profiler Invalidated Records',
};
const updatedRecordsTab = {
  id: ('updatedRecords': TabID),
  label: 'Updated Records Notify',
  title: 'Relay Profiler Updated Records',
};

const tabs = [explorerTab, snapshotTab, optimisticTab, profilerTab];
const notifyCompleteTabs = [invalidatedRecordsTab, updatedRecordsTab];

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
  );
}

function RecordList({
  records,
  recordsByType,
  selectedRecordID,
  setSelectedRecordID,
}) {
  const [recordSearch, setRecordSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setRecordSearch(e.target.value);
  }, []);
  const [recordListStyles, setRecordListStyles] = useState({});
  const [plusMinusCollapse, setPlusMinusCollapse] = useState({});

  if (records == null || recordsByType == null) {
    return <div>Loading...</div>;
  }

  let recordsArray = Array.from(recordsByType).map((recs, _) => {
    const typename = ((recs[0]: any): string);
    const ids = recs[1];

    return (
      <div key={typename}>
        <div className={styles.Collapse}>
          <button
            key={typename}
            onClick={() => {
              if (recordListStyles[typename] === 'none') {
                setRecordListStyles({
                  ...recordListStyles,
                  [typename]: 'block',
                });
                setPlusMinusCollapse({ ...plusMinusCollapse, [typename]: '-' });
              } else {
                setRecordListStyles({
                  ...recordListStyles,
                  [typename]: 'none',
                });
                setPlusMinusCollapse({ ...plusMinusCollapse, [typename]: '+' });
              }
            }}
            className={styles.Type}
          >
            {typename}
          </button>
          <span className={styles.PlusMinusCollapse}>
            {plusMinusCollapse[typename] == null
              ? '-'
              : plusMinusCollapse[typename]}
          </span>
        </div>
        <div
          className={styles.RecordListContent}
          style={{
            display:
              recordListStyles[typename] == null
                ? 'block'
                : recordListStyles[typename],
          }}
        >
          {ids
            .filter(id =>
              recordSearch
                .trim()
                .split(' ')
                .some(
                  search =>
                    id.toLowerCase().includes(search.toLowerCase()) ||
                    typename.toLowerCase().includes(search.toLowerCase())
                )
            )
            .map(id => {
              return (
                <div
                  key={id}
                  onClick={() => {
                    setSelectedRecordID(id);
                  }}
                  className={`${styles.Record} ${
                    id === selectedRecordID ? styles.SelectedRecord : ''
                  }`}
                >
                  {id}
                </div>
              );
            })}
        </div>
        <hr />
      </div>
    );
  });

  return (
    <div className={styles.Records}>
      <input
        className={styles.RecordsSearchBar}
        type="text"
        onChange={fetchSearchBarText}
        placeholder="Search"
      ></input>
      {recordsArray.length <= 0 && recordSearch !== '' ? (
        <p className={styles.RecordNotFound}>
          Sorry, no records with the name '{recordSearch}' were found!
        </p>
      ) : (
        recordsArray
      )}
    </div>
  );
}

function RecordDetails({ records, selectedRecord, setSelectedRecordID }) {
  if (selectedRecord == null) {
    return <div className={styles.RecordDetails}>No record selected</div>;
  }

  const { __id, __typename, ...data } = selectedRecord;

  let typename: string = (__typename: any);
  let id: string = (__id: any);

  return (
    <div className={styles.RecordDetails}>
      <Section title="ID">{id}</Section>
      <Section title="Type">{typename}</Section>
      <InspectedElementTreeStoreInspector
        label="Store data"
        data={data}
        records={records}
        setSelectedRecordID={setSelectedRecordID}
        showWhenEmpty
      />
    </div>
  );
}

function SnapshotList({
  snapshotList,
  setSelectedSnapshotID,
  selectedSnapshotID,
}) {
  let snapshotIDs = Object.keys(snapshotList).map(snapshotID => {
    return (
      <div
        key={snapshotID}
        onClick={() => {
          setSelectedSnapshotID(snapshotID);
        }}
        className={`${styles.Record} ${
          snapshotID === selectedSnapshotID ? styles.SelectedRecord : ''
        }`}
      >
        {snapshotID}
      </div>
    );
  });

  return (
    <div className={styles.SnapshotList}>
      <h2>Snapshots</h2>
      <div>{snapshotIDs}</div>
    </div>
  );
}

function SnapshotDetails({
  snapshotList,
  snapshotListByType,
  selectedSnapshotID,
}) {
  const [selectedRecordID, setSelectedRecordID] = useState(0);
  let snapshotRecords = snapshotList[selectedSnapshotID];
  if (snapshotRecords == null) {
    return null;
  }
  let snapshotRecordsByType = snapshotListByType[selectedSnapshotID];
  let selectedRecord = snapshotRecords[selectedRecordID];

  return (
    <div className={styles.TabContent}>
      <RecordList
        records={snapshotRecords}
        recordsByType={snapshotRecordsByType}
        selectedRecordID={selectedRecordID}
        setSelectedRecordID={setSelectedRecordID}
      />
      <RecordDetails
        records={snapshotRecords}
        setSelectedRecordID={setSelectedRecordID}
        selectedRecord={selectedRecord}
      />
    </div>
  );
}

function Snapshots({ envSnapshotList, envSnapshotListByType, currentEnvID }) {
  const [selectedSnapshotID, setSelectedSnapshotID] = useState(0);

  if (
    envSnapshotList == null ||
    Object.keys(envSnapshotList).length <= 0 ||
    currentEnvID == null ||
    envSnapshotList[currentEnvID] == null
  ) {
    return (
      <div>
        No Snapshots! <br /> To take a snapshot, hit the snapshot button!
      </div>
    );
  }

  let snapshotList = envSnapshotList[currentEnvID];
  let snapshotListByType = envSnapshotListByType[currentEnvID];

  return (
    <div className={styles.TabContent}>
      <SnapshotList
        snapshotList={snapshotList}
        setSelectedSnapshotID={setSelectedSnapshotID}
        selectedSnapshotID={selectedSnapshotID}
      />
      <SnapshotDetails
        snapshotList={snapshotList}
        snapshotListByType={snapshotListByType}
        selectedSnapshotID={selectedSnapshotID}
      />
    </div>
  );
}

function Optimistic({ optimisticUpdates }) {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  if (optimisticUpdates == null) {
    return <div>No Optimistic Updates!</div>;
  }
  let optimisticUpdatesByType = new Map();

  for (let key in optimisticUpdates) {
    let rec = optimisticUpdates[key];
    if (rec != null) {
      let arr = optimisticUpdatesByType.get(rec.__typename);
      if (arr) {
        arr.push(key);
      } else {
        optimisticUpdatesByType.set(rec.__typename, [key]);
      }
    }
  }

  let selectedRecord = optimisticUpdates[selectedRecordID];

  return (
    <div className={styles.TabContent}>
      <RecordList
        records={optimisticUpdates}
        recordsByType={optimisticUpdatesByType}
        selectedRecordID={selectedRecordID}
        setSelectedRecordID={setSelectedRecordID}
      />
      <RecordDetails
        records={optimisticUpdates}
        setSelectedRecordID={setSelectedRecordID}
        selectedRecord={selectedRecord}
      />
    </div>
  );
}

function RecordEventsMenu({
  isProfiling,
  startProfiling,
  stopProfiling,
  stopAndClearProfiling,
  store,
}) {
  let className = isProfiling
    ? styles.ActiveRecordToggle
    : styles.InactiveRecordToggle;

  return (
    <div className={styles.RecordEventsMenu}>
      <Button
        onClick={isProfiling ? stopProfiling : startProfiling}
        title={isProfiling ? 'Stop profiling' : 'Start profiling'}
        className={className}
      >
        <ButtonIcon type="record" />
      </Button>
      <Button onClick={stopAndClearProfiling} title="Stop and Clear Profiling">
        <ButtonIcon type="clear" />
      </Button>
      <RecordingImportExportButtons isProfiling={isProfiling} store={store} />
    </div>
  );
}

function StoreEventDisplay({
  displayText,
  index,
  setSelectedEventID,
  selectedEventID,
}) {
  return (
    <div
      key={index}
      onClick={() => {
        setSelectedEventID(index);
      }}
      className={`${styles.Record} ${
        index === selectedEventID ? styles.SelectedRecord : ''
      }`}
    >
      {displayText}
    </div>
  );
}

function AllEventsList({ events, selectedEventID, setSelectedEventID }) {
  const [eventSearch, setEventSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setEventSearch(e.target.value);
  }, []);

  let eventsArrayDisplay = events.map((event, index) => {
    switch (event.name) {
      case 'store.publish':
        return event.optimistic ? (
          <StoreEventDisplay
            displayText={'Optimistic Update: ' + event.name}
            key={index}
            index={index}
            setSelectedEventID={setSelectedEventID}
            selectedEventID={selectedEventID}
          />
        ) : (
          <StoreEventDisplay
            displayText={event.name}
            key={index}
            index={index}
            setSelectedEventID={setSelectedEventID}
            selectedEventID={selectedEventID}
          />
        );
      case 'store.gc':
      case 'store.restore':
      case 'store.snapshot':
      case 'store.notify.start':
      case 'store.notify.complete':
      case 'execute.start':
      case 'execute.info':
      case 'execute.next':
      case 'execute.complete':
      case 'execute.subscribe':
      case 'execute.error':
      default:
        return (
          <StoreEventDisplay
            displayText={event.name}
            key={index}
            index={index}
            setSelectedEventID={setSelectedEventID}
            selectedEventID={selectedEventID}
          />
        );
    }
  });

  // TODO(damassart): Fix search
  // TODO(damassart): Memoize this
  eventsArrayDisplay = eventsArrayDisplay.filter(event =>
    eventSearch
      .trim()
      .split(' ')
      .some(
        search =>
          event != null &&
          String(event.props.displayText)
            .toLowerCase()
            .includes(search.toLowerCase())
      )
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

function RequestDetails(props: {| request: ?RequestEntry |}) {
  const request = props.request;
  if (request == null) {
    return <div className={styles.RequestDetails}>No request selected</div>;
  }
  const responses = request.responses.map((response, i) => (
    <InspectedElementTree
      key={i}
      label={
        request.responses.length > 1
          ? `response (${i + 1} of ${request.responses.length})`
          : 'response'
      }
      data={response}
      showWhenEmpty
    />
  ));
  return (
    <div className={styles.RequestDetails}>
      <Section title="Status">{request.status}</Section>
      <InspectedElementTree
        label="request"
        data={request.params}
        showWhenEmpty
      />
      <InspectedElementTree
        label="variables"
        data={request.variables}
        showWhenEmpty
      />
      <InspectedElementTree label="info" data={request.infos} />
      {responses}
    </div>
  );
}

function AllEventsDetails({ events, selectedEventID, setSelectedEventID }) {
  const [selectedRecordID, setSelectedRecordID] = useState('');
  const [tab, setTab] = useState(updatedRecordsTab);
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

  if (selectedEvent.name === 'execute.start') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [],
      infos: [],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'execute.complete') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'completed',
      responses: [],
      infos: [],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'execute.next') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [selectedEvent.response],
      infos: [],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'execute.info') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [],
      infos: [selectedEvent.info],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'execute.unsubscribe') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'unsubscribed',
      responses: [],
      infos: [],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'execute.error') {
    const request: RequestEntry = {
      id: selectedEvent.transactionID,
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'error',
      responses: [],
      infos: [],
    };
    return <RequestDetails request={request} />;
  } else if (selectedEvent.name === 'store.publish') {
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

    return (
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
    return <div className={styles.RestoreEvent}>Relay Runtime Snapshot</div>;
  } else if (selectedEvent.name === 'store.notify.start') {
    return <div className={styles.RestoreEvent}>Store Notify Start</div>;
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
        )}
        {tab === invalidatedRecordsTab && (
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
        )}
      </div>
    );
  } else {
    return null;
  }
}

function Profiler({ allEvents, isProfiling }) {
  const [selectedEventID, setSelectedEventID] = useState(0);

  if (allEvents == null && !isProfiling) {
    return (
      <div className={styles.NotRecording}>
        Profiler is not recording. To record, hit the record button on the top
        left of the tab.
      </div>
    );
  } else if (allEvents == null && isProfiling) {
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
      />
      <AllEventsDetails
        events={allEvents}
        selectedEventID={selectedEventID}
        setSelectedEventID={setSelectedEventID}
      />
    </div>
  );
}

function deepCopyFunction(inObject) {
  if (typeof inObject !== 'object' || inObject === null) {
    return inObject;
  }

  if (Array.isArray(inObject)) {
    let outObject = [];
    for (let i = 0; i < inObject.length; i++) {
      let value = inObject[i];
      outObject[i] = deepCopyFunction(value);
    }
    return outObject;
  } else if (inObject instanceof Map) {
    let outObject = new Map();
    inObject.forEach((val, key) => {
      outObject.set(key, deepCopyFunction(val));
    });
    return outObject;
  } else {
    let outObject = {};
    for (let key in inObject) {
      let value = inObject[key];
      if (typeof key === 'string' && key != null) {
        outObject[key] = deepCopyFunction(value);
      }
    }
    return outObject;
  }
}

export default function StoreInspector(props: {|
  +portalContainer: mixed,
  currentEnvID: ?number,
|}) {
  const store = useContext(StoreContext);
  const bridge = useContext(BridgeContext);
  const [tab, setTab] = useState(explorerTab);
  const [, forceUpdate] = useState({});
  const [envSnapshotList, setEnvSnapshotList] = useState({});
  const [envSnapshotListByType, setEnvSnapshotListByType] = useState({});

  const [isProfiling, setIsProfiling] = useState(false);
  const stopAndClearProfiling = useCallback(() => {
    setIsProfiling(false);
    store.stopProfiling();
    store.clearAllEvents();
  }, [store, setIsProfiling]);
  const stopProfiling = useCallback(() => {
    setIsProfiling(false);
    store.stopProfiling();
  }, [store, setIsProfiling]);
  const startProfiling = useCallback(() => {
    setIsProfiling(true);
    store.startProfiling();
  }, [store, setIsProfiling]);

  useEffect(() => {
    const refreshEvents = () => {
      forceUpdate({});
    };
    store.addListener('storeDataReceived', refreshEvents);
    store.addListener('allEventsReceived', refreshEvents);
    return () => {
      store.removeListener('storeDataReceived', refreshEvents);
      store.removeListener('allEventsReceived', refreshEvents);
    };
  }, [store]);

  const [selectedRecordID, setSelectedRecordID] = useState('');
  let records = {};
  let recordsByType = new Map();

  const refreshStore = useCallback(() => {
    let currEnvID = props.currentEnvID;
    if (currEnvID != null) {
      let recordsArr = envSnapshotList[currEnvID] || [];
      recordsArr.push(deepCopyFunction(records));
      let recordsTypeArr = envSnapshotListByType[currEnvID] || [];
      recordsTypeArr.push(deepCopyFunction(recordsByType));
      setEnvSnapshotList({ ...envSnapshotList, [currEnvID]: recordsArr });
      setEnvSnapshotListByType({
        ...envSnapshotListByType,
        [currEnvID]: recordsTypeArr,
      });
      bridge.send('refreshStore', currEnvID);
    }
  }, [
    props,
    bridge,
    records,
    recordsByType,
    envSnapshotList,
    envSnapshotListByType,
  ]);

  const copyToClipboard = useCallback(() => {
    copy(serializeDataForCopy(records));
  }, [records]);

  const currentEnvID = props.currentEnvID;

  if (currentEnvID == null) {
    return null;
  }

  let allEvents = store.getEvents(currentEnvID);

  records = store.getRecords(currentEnvID);
  let optimisticUpdates = store.getOptimisticUpdates(currentEnvID);
  let selectedRecord = {};
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
    selectedRecord = records[selectedRecordID];
  }

  if (records == null) {
    return null;
  }
  return (
    <div className={styles.StoreInspector}>
      <div className={styles.Toolbar}>
        <button
          className={styles.RefreshButton}
          onClick={refreshStore}
          title="Refresh"
        >
          Take Snapshot
        </button>
        <Button onClick={copyToClipboard} title="Copy to clipboard">
          <ButtonIcon type="copy" />
        </Button>
        <div className={styles.Spacer} />
      </div>
      <div className={styles.TabBar}>
        <div className={styles.Spacer} />
        <TabBar
          tabID={tab.id}
          id="StoreTab"
          selectTab={setTab}
          size="small"
          tabs={tabs}
        />
      </div>
      <div className={styles.Content}>
        {tab === explorerTab && (
          <div className={styles.TabContent}>
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
        )}
        {tab === snapshotTab && (
          <div className={styles.TabContent}>
            <Snapshots
              envSnapshotList={envSnapshotList}
              envSnapshotListByType={envSnapshotListByType}
              currentEnvID={props.currentEnvID}
            />
          </div>
        )}
        {tab === optimisticTab && (
          <div className={styles.TabContent}>
            <Optimistic optimisticUpdates={optimisticUpdates} />
          </div>
        )}
        {tab === profilerTab && (
          <div className={styles.RecordEvents}>
            <RecordEventsMenu
              isProfiling={isProfiling}
              stopProfiling={stopProfiling}
              startProfiling={startProfiling}
              stopAndClearProfiling={stopAndClearProfiling}
              store={store}
            />
            <Profiler allEvents={allEvents} isProfiling={isProfiling} />
          </div>
        )}
      </div>
    </div>
  );
}
