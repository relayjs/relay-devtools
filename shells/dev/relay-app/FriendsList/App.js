// @flow

import React, { Fragment } from 'react';
import { Environment, RecordSource, Store } from 'relay-runtime';
import { graphql, QueryRenderer } from 'react-relay';
import network from './InBrowserNetwork';
import Friends from './Friends';

const source = new RecordSource();
const store = new Store(source);

const environment = new Environment({
  configName: 'Example Environment',
  network,
  store,
});

export type Item = {|
  id: number,
  isComplete: boolean,
  text: string,
|};

type Props = {||};

export default function App(props: Props) {
  return (
    <Fragment>
      <h1>Example Relay App</h1>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query AppQuery {
            user: node(id: "my-id") {
              ... on User {
                name
                ...Friends_user
              }
            }
          }
        `}
        variables={{}}
        render={({ props }) => {
          if (props) {
            return (
              <Fragment>
                <div>Hello, {props.user.name}!</div>
                <Friends user={props.user} />
              </Fragment>
            );
          }
          return 'Data is not ready.';
        }}
      />
    </Fragment>
  );
}
