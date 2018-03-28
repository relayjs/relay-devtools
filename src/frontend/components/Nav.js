/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
    const {tools, currentTool, onSwitch, notifications} = this.props;
    const {prevNotifications} = this;
    this.prevNotifications = notifications;

    const displayNames = {
      store: 'Store Explorer',
      updates: 'Updates',
    };

    return (
      <div className="nav">
        {tools.map(tool => {
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
