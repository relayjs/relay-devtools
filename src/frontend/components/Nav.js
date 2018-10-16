/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import AnimateOnChange from 'react-animate-on-change';

import '../css/Nav.less';

export default class Nav extends React.Component {
  constructor() {
    super();
    this.prevNotifications = {};
  }
  render() {
    const {
      tools,
      currentTool,
      onSwitch,
      newUpdateNotification: notifications,
      gcData,
      renderEnvironmentChooser,
    } = this.props;
    const {prevNotifications} = this;
    this.prevNotifications = notifications;

    const displayNames = {
      store: 'Store',
      updates: 'Updates',
      // environment: 'Environment',
    };

    return (
      <div className="nav" style={{flex: 1}}>
        {gcData && (
          <span>GC {gcData._gcEnabled ? `Enabled ` : `Disabled `}</span>
        )}
        {gcData && (
          <span style={{flex: 1}}>
            &nbsp; {` and`}{' '}
            {gcData._hasScheduled ? 'Scheduled' : 'not Scheduled'}
          </span>
        )}
        <span className="nav-item">
          {renderEnvironmentChooser && renderEnvironmentChooser()}
        </span>

        {Object.keys(displayNames).map(tool => {
          const current = notifications[tool];
          const previous = prevNotifications[tool];
          const selected = tool === currentTool;
          const animated = current !== previous;
          const showIndicator = Boolean(current) && !selected;
          return (
            <span
              className={`nav-item ${selected ? 'current' : ''}`}
              key={tool}
              onClick={() => onSwitch(tool)}>
              {displayNames[tool]}
              <AnimateOnChange
                baseClassName="indicator-container"
                animationClassName="indicator-container--updated"
                animate={animated}>
                <span
                  className={'indicator' + (showIndicator ? '' : ' disabled')}
                />
              </AnimateOnChange>
            </span>
          );
        })}
        <hr />
      </div>
    );
  }
}
