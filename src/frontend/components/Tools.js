/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import '../css/Tools.less';

import React from 'react';
import StoreExplorer from '../containers/StoreExplorer';
import UpdatesView from '../containers/UpdatesView';
import Nav from '../containers/Nav';

import type {Tool} from '../reducers/types';

type Props = {|
  +currentTool: Tool,
  // +newUpdateNotification: boolean,
  // +onSwitch: () => void,
|};

export default class Tools extends React.Component<Props> {
  render() {
    const {
      currentTool,
      // newUpdateNotification,
      // onSwitch
    } = this.props;

    const tools = {
      store: StoreExplorer,
      updates: UpdatesView,
    };
    return (
      <div className="tools">
        {Object.keys(tools).map(key => {
          const Comp = tools[key];
          return (
            <Hidable hide={key !== currentTool} key={key}>
              <Comp />
            </Hidable>
          );
        })}
        {/* <Nav
          onSwitch={onSwitch}
          tools={Object.keys(tools)}
          notifications={{
            updates: newUpdateNotification ? 1 : 0,
          }}
          currentTool={currentTool}
        /> */}
      </div>
    );
  }
}

// Hacky wrapper component to hide components without unmounting them.
// This is important so components don't lose their state.
function Hidable(props) {
  const style = {
    height: '100%',
    width: '100%',
    display: props.hide ? 'none' : 'block',
  };
  return <div style={style}>{props.children}</div>;
}
