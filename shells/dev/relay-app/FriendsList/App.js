// @flow

import React, { Fragment } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import Friends from './Friends';
import MockPayload from './MockPayload';

export type Item = {|
  id: number,
  isComplete: boolean,
  text: string,
|};

type Props = {||};

const mockPayload = new MockPayload();
const environment = createMockEnvironment();
environment.mock.queueOperationResolver(operation =>
  MockPayloadGenerator.generate(operation, mockPayload.generate())
);

export default function List(props: Props) {
  return (
    <Fragment>
      <h1>List</h1>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query AppQuery @relay_test_operation {
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
                <Friends mockPayload={mockPayload} user={props.user} />
              </Fragment>
            );
          }
          return 'Data is not ready.';
        }}
      />
    </Fragment>
  );
}
