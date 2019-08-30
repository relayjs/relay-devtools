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

  const [_, forceUpdate] = useState({});

  useEffect(() => {
    const onMutated = () => {
      forceUpdate({});
    };
    store.on('mutated', onMutated);
    return () => {
      store.off('mutated', onMutated);
    };
  }, [store]);

  const [selectedTabID, setSelectedTabID] = useState('bar');
  const [selectedRequestID, setSelectedRequestID] = useState(0);

  const operations = store.getOperations();

  const requests = operations.map((name, i) => ({
    id: i,
    name: name,
  }));

  return (
    <div className={styles.Network}>
      <div className={styles.Toolbar}>
        <Button
          onClick={() => {
            alert('not implememnted');
          }}
          title="Clear Logs"
        >
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
        <div className={styles.Requests}>
          {requests.map(request => (
            <div
              key={request.id}
              onClick={() => {
                setSelectedRequestID(request.id);
              }}
              className={`${styles.Request} ${
                request.id === selectedRequestID ? styles.SelectedRequest : ''
              }`}
            >
              {request.name}
            </div>
          ))}
        </div>
        <div className={styles.RequestDetails}>
          {requests.find(req => req.id === selectedRequestID)?.name}
        </div>
      </div>
    </div>
  );
}
