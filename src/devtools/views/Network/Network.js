// @flow

import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../context';
import ButtonIcon from '../ButtonIcon';
import Button from '../Button';
import InspectedElementTree from '../Components/InspectedElementTree';

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

function Network(props: {| +portalContainer: mixed |}) {
  const store = useContext(StoreContext);

  const [, forceUpdate] = useState({});

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
  const events = store.getEvents();

  const requests: Map<number, RequestEntry> = new Map();

  for (const event of events) {
    switch (event.name) {
      case 'execute.start': {
        requests.set(event.transactionID, {
          id: event.transactionID,
          params: event.params,
          variables: event.variables,
          status: 'active',
          responses: [],
          infos: [],
        });
        break;
      }
      case 'execute.complete': {
        const request = requests.get(event.transactionID);
        if (request != null) {
          request.status = 'completed';
        }
        break;
      }
      case 'execute.next': {
        const request = requests.get(event.transactionID);
        if (request != null) {
          request.responses.push(event.response);
        }
        break;
      }
      case 'execute.info': {
        const request = requests.get(event.transactionID);
        if (request != null) {
          request.infos.push(event.info);
        }
        break;
      }
      case 'execute.unsubscribe': {
        const request = requests.get(event.transactionID);
        if (request != null) {
          request.status = 'unsubscribed';
        }
        break;
      }
      case 'execute.error': {
        const request = requests.get(event.transactionID);
        if (request != null) {
          request.status = 'error';
        }
        break;
      }
      case 'queryresource.fetch':
        // ignore
        break;
      default: {
        /*:: (event.name: null); */
        break;
        // ignore unknown events
      }
    }
  }

  let selectedRequest = requests.get(selectedRequestID);

  const requestRows = Array.from(requests.values(), request => {
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
        <Button onClick={store.clearEvents} title="Clear Logs">
          <ButtonIcon type="clear" />
        </Button>
        <div className={styles.Spacer} />
      </div>
      <div className={styles.Content}>
        <div className={styles.Requests}>{requestRows}</div>
        <RequestDetails request={selectedRequest} />
      </div>
    </div>
  );
}

export default portaledContent(Network);
