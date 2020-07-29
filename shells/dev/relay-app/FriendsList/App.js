/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { useCallback, useState, Fragment } from 'react';
import { Environment, RecordSource, Store } from 'relay-runtime';
import { graphql, QueryRenderer } from 'react-relay';
import createInBrowserNetwork from './createInBrowserNetwork';
import Friends from './Friends';

function createNewEnvironment(configName) {
  const source = new RecordSource();
  const store = new Store(source);
  var environment = new Environment({
    configName,
    network: createInBrowserNetwork(),
    store,
    log(event) {
      console.log('[APP]', event);
    },
  });
  return environment;
}

const initialEnvironment = createNewEnvironment('Example Environment');

export type Item = {|
  id: number,
  isComplete: boolean,
  text: string,
|};

type Props = {||};

export default function App(props: Props) {
  // Add initial environment to environmentList
  const [environmentList, updateEnvironmentList] = useState({
    'Example Environment': initialEnvironment,
  });
  const [currentEnvironment, setCurrentEnvironment] = useState(
    initialEnvironment
  );

  const createUpdateEnvironmentList = useCallback(() => {
    const newEnvironment = createNewEnvironment(
      'Example Environment ' + Object.keys(environmentList).length
    );

    updateEnvironmentList({
      ...environmentList,
      [newEnvironment.configName]: newEnvironment,
    });
  }, [environmentList]);

  const selectNewEnvironment = useCallback(
    e => {
      setCurrentEnvironment(environmentList[e.target.value]);
    },
    [environmentList]
  );

  return (
    <Fragment>
      <div className="addEnvironment">
        <h1>Example Relay App</h1>
        <button onClick={createUpdateEnvironmentList}>
          Create Environment
        </button>
        <select onChange={selectNewEnvironment}>
          {Object.keys(environmentList).map(key => (
            <option>{key}</option>
          ))}
        </select>
      </div>
      <QueryRenderer
        environment={currentEnvironment}
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
        // eslint-disable-next-line no-shadow
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
