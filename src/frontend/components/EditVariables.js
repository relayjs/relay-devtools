/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React from 'react';
import StoreExplorer from '../containers/StoreExplorer';
import EnvironmentChooser from '../containers/EnvironmentChooser';
import UpdatesView from '../containers/UpdatesView';
import Nav from './Nav';
// const {Environment, Network, RecordSource, Store} = require('relay-runtime');

import '../css/Tools.less';

import type {Tool} from '../reducers/types';

type Props = {|
  +currentTool: Tool,
  +newUpdateNotification: boolean,
  +onSwitch: () => void,
|};

// const source = new RecordSource();
// const store = new Store(source);
// const network = Network.create(/* ...*/); // see note below
const handlerProvider = null;

// const environment = new Environment({
//   handlerProvider, // Can omit.
//   network,
//   store,
// });

export default class EditVariables extends React.Component<Props> {
  componentDidMount() {
    this.props.loadEnvironment();
  }
  // const {createOperationSelector, getRequest} = environment.unstable_internal;
  // const query = getRequest(taggedNode);
  // const operation = createOperationSelector(query, variables);

  handleQuery = () => {
    const cacheConfig = {};
    // const operation = this.props.updatesView.events[1].operation;
    // const environment = this.props.environmentList[0]._environment;
    // return environment
    //   .execute({operation, cacheConfig})
    //   .map(() => environment.lookup(operation.fragment).data)
    //   .toPromise()
    //   .then(data => {});
  };
  render() {
    return (
      <div className="tools">
        {/* {Object.keys(tools).map(key => {
          const Comp = tools[key];
          return (


          );
        })} */}
        {/* <Nav
          onSwitch={onSwitch}
          tools={Object.keys(tools)}
          notifications={{
            updates: newUpdateNotification ? 1 : 0,
          }}
          currentTool={currentTool}
        /> */}
        <div onClick={this.handleQuery}>CLICK ME</div>
      </div>
    );
  }
}

// Hacky wrapper component to hide components without unmounting them.
// This is important so components don't lose their state.
// function Hidable(props) {
//   const style = {
//     height: '100%',
//     width: '100%',
//     display: props.hide ? 'none' : 'block',
//   };
//   return <div style={style}>{props.children}</div>;
// }
