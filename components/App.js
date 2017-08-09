/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';

import EnvironmentChooser from './EnvironmentChooser';
import StoreExplorer from './StoreExplorer';
import MutationsView from './MutationsView';
import Nav from './Nav';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      tool: 'store',
      // mapping 'tool' => count, how many new notifications arrived
      notifications: {},
    };

    this.onSwitch = this.onSwitch.bind(this);
  }

  onSwitch(tool) {
    const notifications = Object.assign({}, this.state.notifications);
    notifications[tool] = 0;

    this.setState({
      tool,
      notifications,
    });
  }

  onNotification(tool) {
    const notifications = Object.assign({}, this.state.notifications);
    notifications[tool] = (notifications[tool] || 0) + 1;

    this.setState({
      notifications,
    });
  }

  render() {
    const { tool, notifications } = this.state;
    const tools = {
      store: StoreExplorer,
      mutations: MutationsView,
    };

    return (
      <EnvironmentChooser>
        {Object.keys(tools).map(key => {
          const Comp = tools[key];
          const onNotification = () => this.onNotification(key);
          return (
            <Hidable hide={key !== tool} key={key}>
              <Comp onNotification={onNotification} />
            </Hidable>
          );
        })}
        <Nav
          onSwitch={this.onSwitch}
          tools={Object.keys(tools)}
          notifications={notifications}
          currentTool={tool}
        />
      </EnvironmentChooser>
    );
  }
}

// Hacky wrapper component to hide components without unmounting them.
// This is important so components don't lose their state.
function Hidable(props) {
  const { hide, children } = props;
  const style = hide ? { display: 'none' } : {};
  return (
    <div style={style}>
      {// pass through all props
      React.Children.map(children, child => React.cloneElement(child, props))}
    </div>
  );
}
