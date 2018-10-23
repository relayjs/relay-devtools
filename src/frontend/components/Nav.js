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

  _getEnvironmentName = (currentEnvironment) => {
    const {
      environmentsDetails,
    } = this.props;

    return (
      environmentsDetails &&
      environmentsDetails.length > 0 &&
      environmentsDetails[currentEnvironment] &&
      environmentsDetails[currentEnvironment]._environment &&
      environmentsDetails[currentEnvironment]._environment.configName ||
      `Environment ${Number(currentEnvironment) + 1}`
    );
  }

  render() {
    const {
      // tools,
      currentTool,
      onSwitch,
      notifications,
      environmentsDetails,
      environments,
      currentEnvironment,
      onChange
    } = this.props;
    const {prevNotifications} = this;
    this.prevNotifications = notifications;

    const displayNames = {
      store: 'Store Explorer',
      updates: 'Updates',
    };

    const handleChange = (e: SyntheticEvent<>) => onChange(e.target.value);
    return (
      <div
        style={{
          border: '2px solid green',
          /* flex: 1; */
          display: 'flex',
          boxSizing: 'border-box',
          alignItems: 'center',
          width: '100%',
          padding: '8px'
        }}>
        <span style={{
          flex: 1,
          paddingLeft: '0 5px 0 0'
        }}>
          Environment Select
          {/* <select defaultValue={currentEnvironment} onChange={handleChange} style={{

            'border': 'none',
            '-webkit-appearance': 'none',
            '-moz-appearance': 'none',
            'appearance': 'none',
            '-ms-appearance': 'none',
            'background': 'none',
            'font-weight': 'normal',

          }}>
            {environments.map(env => <option key={env} value={env}>{this._getEnvironmentName(env)}</option>)}
          </select> */}
        </span>
        {Object.keys(displayNames).map(tool => {
          const current = notifications[tool];
          const previous = prevNotifications[tool];
          const selected = tool === currentTool;
          const animated = current !== previous;
          const showIndicator = Boolean(current) && !selected;
          return (
            <span
              // className={`nav-item ${selected ? 'current' : ''}`}
              style={{
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center'
              }}
              key={tool}
              onClick={() => onSwitch(tool)}>
              {displayNames[tool]}
              {/* <AnimateOnChange
                baseClassName="indicator-container"
                animationClassName="indicator-container--updated"
                animate={animated}> */}
                {/* <span
                  // className={'indicator' + (showIndicator ? '' : ' disabled')}
                // /> */}
              {/* </AnimateOnChange> */}
            </span>
          );
        })}
        <hr />
      </div>
    );
  }
}
