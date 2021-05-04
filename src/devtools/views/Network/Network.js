/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StoreContext } from '../context';
import ButtonIcon from '../ButtonIcon';
import Button from '../Button';
import InspectedElementTree from '../Components/InspectedElementTree';
import { getEventId } from '../../../utils';

import portaledContent from '../portaledContent';
import styles from './Network.css';

type RequestStatus = 'active' | 'unsubscribed' | 'completed' | 'error';
type RequestEntry = {|
  +id: number,
  params: any,
  variables: { [string]: mixed },
  status: RequestStatus,
  responses: Array<mixed>,
  infos: Array<mixed>,
|};

function Section(props: {| title: string, children: React$Node |}) {
  return (
    <>
      <div className={styles.SectionTitle}>{props.title}</div>
      <div className={styles.SectionContent}>{props.children}</div>
    </>
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

function appearsInResponse(searchText: string, response: Object) {
  if (response == null) {
    return false;
  }
  for (const key in response) {
    if (typeof response[key] == 'object' && response[key] !== null) {
      return appearsInResponse(searchText, response[key]);
    } else if (
      response[key] !== null &&
      response[key]
        .toString()
        .toLowerCase()
        .includes(searchText)
    ) {
      return true;
    }
  }
  return false;
}

function Network(props: {| +portalContainer: mixed, currentEnvID: ?number |}) {
  const store = useContext(StoreContext);

  const [, forceUpdate] = useState({});
  const [requestSearch, setRequestSearch] = useState('');
  const fetchSearchBarText = useCallback(e => {
    setRequestSearch(e.target.value);
  }, []);

  useEffect(() => {
    const onMutated = () => {
      forceUpdate({});
    };
    store.addListener('mutated', onMutated);
    return () => {
      store.removeListener('mutated', onMutated);
    };
  }, [store]);

  const [selectedRequestID, setSelectedRequestID] = useState(0);

  if (props.currentEnvID == null) {
    return null;
  }

  const events = store.getEnvironmentEvents(props.currentEnvID) || [];

  const requests: Map<number, RequestEntry> = new Map();

  for (const event of events) {
    switch (event.name) {
      case 'execute.start':
      case 'network.start': {
        const eventId = getEventId(event);
        requests.set(eventId, {
          id: eventId,
          params: event.params,
          variables: event.variables,
          status: 'active',
          responses: [],
          infos: [],
        });
        break;
      }
      case 'execute.complete':
      case 'network.complete': {
        const eventId = getEventId(event);
        const request = requests.get(eventId);
        if (request != null) {
          request.status = 'completed';
        }
        break;
      }
      case 'execute.next':
      case 'network.next': {
        const eventId = getEventId(event);
        const request = requests.get(eventId);
        if (request != null) {
          request.responses.push(event.response);
        }
        break;
      }
      case 'execute.info':
      case 'network.info': {
        const eventId = getEventId(event);
        const request = requests.get(eventId);
        if (request != null) {
          request.infos.push(event.info);
        }
        break;
      }
      case 'execute.unsubscribe':
      case 'network.unsbuscribe': {
        const eventId = getEventId(event);
        const request = requests.get(eventId);
        if (request != null) {
          request.status = 'unsubscribed';
        }
        break;
      }
      case 'execute.error':
      case 'network.error': {
        const eventId = getEventId(event);
        const request = requests.get(eventId);
        if (request != null) {
          request.status = 'error';
        }
        break;
      }
      case 'store.publish':
        // ignore
        break;
      case 'store.restore':
        //ignore
        break;
      case 'store.gc':
        //ignore
        break;
      case 'store.snapshot':
        //ignore
        break;
      case 'store.notify.start':
        //ignore
        break;
      case 'store.notify.complete':
        //ignore
        break;
      case 'queryresource.fetch':
        // ignore
        break;
      default: {
        break;
        // ignore unknown events
      }
    }
  }
  let selectedRequest = requests.get(selectedRequestID);
  const requestArray = [];
  requests.forEach((request, _) => {
    if (
      requestSearch
        .trim()
        .split(' ')
        .some(
          search =>
            request.params.name.toLowerCase().includes(search.toLowerCase()) ||
            request.responses.some(response =>
              appearsInResponse(search.toLowerCase(), response)
            )
        )
    ) {
      requestArray.push(request);
    }
  });

  const requestRows = requestArray.map(request => {
    if (selectedRequest == null) {
      selectedRequest = request;
    }
    let statusClass;
    switch (request.status) {
      case 'unsubscribed':
        statusClass = styles.StatusUnsubscribed;
        break;
      case 'error':
        statusClass = styles.StatusError;
        break;
      case 'active':
        statusClass = styles.StatusActive;
        break;
      default:
        statusClass = '';
        break;
    }
    return (
      <div
        key={request.id}
        onClick={() => {
          setSelectedRequestID(request.id);
        }}
        className={`${styles.Request} ${
          request.id === selectedRequest?.id ? styles.SelectedRequest : ''
        } ${statusClass}`}
      >
        {request.params.name} ({request.status})
      </div>
    );
  });

  return (
    <div className={styles.Network}>
      <div className={styles.Toolbar}>
        <Button
          onClick={() =>
            props.currentEnvID == null
              ? {}
              : store.clearNetworkEvents(props.currentEnvID)
          }
          title="Clear Logs"
        >
          <ButtonIcon type="clear" />
        </Button>
        <div className={styles.Spacer} />
      </div>
      <div className={styles.Content}>
        <div className={styles.Requests}>
          <input
            className={styles.RequestsSearchBar}
            type="text"
            onChange={fetchSearchBarText}
            placeholder="Search"
          ></input>
          {requestRows.length <= 0 && requestSearch !== '' ? (
            <p className={styles.RequestNotFound}>
              Sorry, no requests with the name '{requestSearch}' were found!
            </p>
          ) : (
            requestRows
          )}
        </div>
        <RequestDetails request={selectedRequest} />
      </div>
    </div>
  );
}

export default portaledContent(Network);
