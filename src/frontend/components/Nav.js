/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

'use strict';

import React from 'react';

import Hoverable from './Hoverable';

const DISPLAY_NAMES = {
  store: 'Stores Explorer',
  updates: 'Updates',
};

export default class Nav extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  _handleSwitch = selectedType => {
    this.setState(
      // $FlowFixMe
      {
        selectedType,
      },
      () => {
        this.props.onSwitch(selectedType);
      },
    );
  };

  render() {
    const {
      currentTool,
      notifications,
      environmentsDetails,
      currentEnvironment,
      onChange,
      onChangeUpdateView,
      viewType,
    } = this.props;

    // $FlowFixMe
    const handleChange = (e: SyntheticEvent<>) => onChange(e.target.value);
    const handleChangeUpdateView = (e: SyntheticEvent<>) =>
      // $FlowFixMe
      onChangeUpdateView(e.target.value);
    return (
      <div style={containerStyle}>
        <div style={{flex: 1, display: 'flex'}}>
          <span style={environmentSelectContainerStyle}>
            <select
              defaultValue={currentEnvironment}
              onChange={handleChange}
              style={environmentSelectStyle}>
              {environmentsDetails &&
                Object.keys(environmentsDetails).map(key => (
                  <option key={key} value={key}>
                    {environmentsDetails[key]}
                  </option>
                ))}
            </select>
            <span style={optionSelectArrow} />
          </span>

          {currentTool === 'updates' && (
            <span style={viewSelectContainerStyle}>
              <select
                defaultValue={viewType}
                onChange={handleChangeUpdateView}
                style={viewSelectStyle}>
                {['list', 'chart'].map(key => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
              <span style={optionSelectArrow} />
            </span>
          )}
        </div>

        {Object.keys(DISPLAY_NAMES).map((tool, key) => {
          const isSelected = tool === currentTool;
          const hrStyle = getHrStyle(isSelected);
          return (
            <div style={navItemContainerStyle} key={key}>
              <NavItem
                onClick={() => this._handleSwitch(tool)}
                notifications={notifications}
                isSelected={isSelected}>
                {DISPLAY_NAMES[tool]}
              </NavItem>
              <hr style={hrStyle} />
            </div>
          );
        })}
      </div>
    );
  }
}

const containerStyle = {
  borderBottom: '1px solid #ddd',
  display: 'flex',
  boxSizing: 'border-box',
  alignItems: 'center',
  width: '100%',
  padding: '0 16px',
};

const environmentSelectContainerStyle = {
  padding: '0 5px 0 5px',
  display: 'flex',
  alignItems: 'center',
};

const viewSelectContainerStyle = {
  marginLeft: '10px',
  padding: '0 5px 0 5px',
  display: 'flex',
  alignItems: 'center',
};

const environmentSelectStyle = {
  border: 'none',
  marginRight: '5px',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  msAppearance: 'none',
  background: 'none',
  fontWeight: 'normal',
  color: '#777',
};
const viewSelectStyle = {
  border: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  msAppearance: 'none',
  background: 'none',
  fontWeight: 'normal',
  color: '#777',
};

const optionSelectArrow = {
  float: 'right',
  width: 0,
  height: 0,
  // marginLeft: '5px',
  borderTop: '6px solid #777',
  borderLeft: '3px solid transparent',
  borderRight: '3px solid transparent',
  color: '#777',
};

const navItemContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100px',
  cursor: 'pointer',
};

const getNavItemStyle = (isHovered: boolean, isSelected: boolean) => ({
  display: 'flex',
  padding: '8px',
  border: 'none',
  outline: 'none',
  color: isHovered && !isSelected ? 'inherit' : '#777',
  background: isHovered && !isSelected ? 'rgba(119, 119, 119, 0.2)' : 'none',
  justifyContent: 'center',
  cursor: 'pointer',
  boxSizing: 'border-box',
});

const getHrStyle = (isSelected: boolean) => ({
  borderBottom: `2px solid ${isSelected ? 'rgb(33, 150, 243)' : 'transparent'}`,
  margin: 0,
  borderTop: 'none',
  cursor: 'pointer',
});

const NavItem = Hoverable(
  ({isHovered, isSelected, onClick, onMouseEnter, onMouseLeave, children}) => (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={getNavItemStyle(isHovered, isSelected)}>
      {children}
    </button>
  ),
);
