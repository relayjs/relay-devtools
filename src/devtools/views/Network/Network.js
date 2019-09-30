// @flow

import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../context';
import TabBar from '../TabBar';
import ButtonIcon from '../ButtonIcon';
import Button from '../Button';

import styles from './Network.css';

const tabs = [
  {
    icon: 'flame-chart',
    id: 'foo',
    label: 'Foo',
  },
  {
    icon: 'flame-chart',
    id: 'bar',
    label: 'Bar',
  },
  {
    icon: 'flame-chart',
    id: 'baz',
    label: 'Baz',
  },
];

export default function Network(props: {| +portalContainer: mixed |}) {
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

  const [selectedTabID, setSelectedTabID] = useState('bar');
  const [selectedRequestID, setSelectedRequestID] = useState(0);

  const events = store.getEvents();

  const requests = new Map();

  for (const event of events) {
    switch (event.name) {
      case 'execute.start': {
        requests.set(event.transactionID, {
          id: event.transactionID,
          params: event.params,
          variables: event.variables,
          status: 'started',
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

  const requestRows = Array.from(requests.values(), request => {
    return (
      <div
        key={request.id}
        onClick={() => {
          setSelectedRequestID(request.id);
        }}
        className={`${styles.Request} ${
          request.id === selectedRequestID ? styles.SelectedRequest : ''
        }`}
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
        <TabBar
          currentTab={selectedTabID}
          id="Profiler"
          selectTab={setSelectedTabID}
          tabs={tabs}
          size="small"
        />
        <div className={styles.Spacer} />
      </div>
      <div className={styles.Content}>
        <div className={styles.Requests}>{requestRows}</div>
        <div className={styles.RequestDetails}>
          <div>
            Variables:{' '}
            {JSON.stringify(requests.get(selectedRequestID)?.variables)}
          </div>
          <pre>
            Reponses:{' '}
            {JSON.stringify(
              requests.get(selectedRequestID)?.responses,
              null,
              2
            )}
          </pre>
          <pre>
            Infos:{' '}
            {JSON.stringify(requests.get(selectedRequestID)?.infos, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
