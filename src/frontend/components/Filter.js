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

type Props = {|
  +placeholder: string,
  +handleChange: string => void,
|};

type State = {|
  +matchTerm: string,
  +matchType: string,
  +searchDetailsOpen: boolean,
|};

export default class Filter extends React.Component<Props, State> {
  state = {
    matchTerm: '',
    matchType: 'idtype',
    searchDetailsOpen: false,
  };
  inputRef: ?HTMLInputElement = null;
  typeSelectRef = null;

  getMatch() {
    return {
      matchType: this.state.matchType,
      matchTerm: this.state.matchTerm,
    };
  }

  showSearchDetails = () => {
    this.setState({
      searchDetailsOpen: true,
    });
  };

  hideSearchDetails = () => {
    this.setState({
      searchDetailsOpen: false,
    });
  };

  handleSearchChange = () => {
    // $FlowFixMe
    this.props.handleChange(this.inputRef.value);
  };

  // $FlowFixMe
  _setDOMNodes = (matchTerm, matchType) => {
    // $FlowFixMe
    this.inputRef.value = matchTerm;
    // $FlowFixMe
    this.typeSelectRef.querySelectorAll(
      `[data-option-name=${matchType}]`,
    )[0].selected = true;
  };

  handleClickOutside = () => {
    this.hideSearchDetails();
  };

  render() {
    return (
      <div style={containerStyle}>
        <input
          type="text"
          style={inputStyle}
          placeholder={this.props.placeholder}
          onFocus={this.showSearchDetails}
          onChange={this.handleSearchChange}
          ref={input => (this.inputRef = input)}
        />
      </div>
    );
  }
}

const containerStyle = {
  padding: '4px',
  border: 'solid 1px #ddd',
  borderRight: 'none',
  borderTop: 'none',
};

const inputStyle = {
  overflow: 'visible',
  border: 0,
  width: '100%',
  outline: 'none',
};
