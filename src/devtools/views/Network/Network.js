// @flow

import React, { useContext, useState } from 'react';
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

const mockRequests = Array.from(Array(30), (_, i) => ({
  id: i,
  name: `Mock Request ${i + 1}`,
}));

export default function Network(props: {| +portalContainer: mixed |}) {
  const x = useContext(StoreContext);

  const [selectedTabID, setSelectedTabID] = useState('bar');
  const [selectedRequestID, setSelectedRequestID] = useState(3);

  console.log({ x });
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
          {mockRequests.map(request => (
            <div
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
          {mockRequests.find(req => req.id === selectedRequestID)?.name}
        </div>
      </div>
    </div>
  );
}
