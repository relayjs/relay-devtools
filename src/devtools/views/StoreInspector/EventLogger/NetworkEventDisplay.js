/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React from 'react';
import InspectedElementTree from '../../Components/InspectedElementTree';
import type { LogEvent } from '../../../../types';
import { getEventId } from '../../../../utils';

import styles from './EventLogger.css';

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

export default function NetworkEventDisplay(props: {|
  selectedEvent: LogEvent,
|}): React$MixedElement | null {
  const { selectedEvent } = props;
  if (selectedEvent.name === 'network.start') {
    const request = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [],
      infos: [],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          The following network request has been sent. Responses will soon
          follow in an network.next event:
        </div>
        <RequestDetails request={(request: $FlowFixMe)} />
      </div>
    );
  } else if (selectedEvent.name === 'network.complete') {
    const request: RequestEntry = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'completed',
      responses: [],
      infos: [],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          The following network request is complete. All info and responses have
          been received:
        </div>
        <RequestDetails request={request} />
      </div>
    );
  } else if (selectedEvent.name === 'network.next') {
    const request: RequestEntry = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [selectedEvent.response],
      infos: [],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          A response for the following request was received:
        </div>
        <RequestDetails request={request} />
      </div>
    );
  } else if (selectedEvent.name === 'network.info') {
    const request: RequestEntry = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'active',
      responses: [],
      infos: [selectedEvent.info],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          The info array for the following request was updated:
        </div>
        <RequestDetails request={request} />
      </div>
    );
  } else if (selectedEvent.name === 'network.unsubscribe') {
    const request: RequestEntry = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'unsubscribed',
      responses: [],
      infos: [],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          The following network request is no longer active:
        </div>
        <RequestDetails request={request} />
      </div>
    );
  } else if (selectedEvent.name === 'network.error') {
    const request: RequestEntry = {
      id: getEventId(selectedEvent),
      params: selectedEvent.params,
      variables: selectedEvent.variables,
      status: 'error',
      responses: [],
      infos: [],
    };
    return (
      <div className={styles.gcEvent}>
        <div className={styles.gcExplained}>
          There was an error with the following network request:
        </div>
        <RequestDetails request={request} />
      </div>
    );
  } else if (selectedEvent.name === 'queryresource.fetch') {
    return <div className={styles.RestoreEvent}>Query Resource Fetched</div>;
  } else {
    return null;
  }
}
