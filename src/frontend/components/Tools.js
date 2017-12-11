/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import StoreExplorer from '../containers/StoreExplorer';
import UpdatesView from '../containers/UpdatesView';
import Nav from './Nav';

import '../css/Tools.less';

export default class Tools extends React.Component {
  render() {
    const { currentTool, notifications, onSwitch } = this.props;

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
        <Nav
          onSwitch={onSwitch}
          tools={Object.keys(tools)}
          notifications={notifications}
          currentTool={currentTool}
        />
      </div>
    );
  }
}

// Hacky wrapper component to hide components without unmounting them.
// This is important so components don't lose their state.
function Hidable(props) {
  const { hide, children } = props;
  const style = Object.assign(
    { height: '100%', width: '100%' },
    hide ? { display: 'none' } : {},
  );
  return (
    <div style={style}>
      {// pass through all props
      React.Children.map(children, child => React.cloneElement(child, props))}
    </div>
  );
}
