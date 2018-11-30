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

const SAVED_SEARCHES_PERSIST_KEY = 'RELAY_DEVTOOLS_SAVED_SEARCHES';

export default class Filter extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  constructor(props) {
    super(props);

    const persistedSearches = window.localStorage.getItem(
      SAVED_SEARCHES_PERSIST_KEY,
    );
    const savedSearches = persistedSearches
      ? JSON.parse(persistedSearches)
      : [];

    // $FlowFixMe
    this.state = {
      matchTerm: '',
      matchType: 'idtype',
      savedSearches,
      searchDetailsOpen: false,
    };

    // $FlowFixMe
    this.inputRef = null;
    // $FlowFixMe
    this.typeSelectRef = null;
    this.pushNewSearch = this.props.pushNewSearch;
  }

  getMatch() {
    return {
      // $FlowFixMe
      matchType: this.state.matchType,
      // $FlowFixMe
      matchTerm: this.state.matchTerm,
    };
  }

  // $FlowFixMe
  setMatch({matchTerm, matchType}, resetDOMFields = true) {
    // $FlowFixMe
    this.setState({
      matchTerm,
      matchType,
    });

    if (resetDOMFields) {
      this._setDOMNodes(matchTerm, matchType);
    }
  }

  showSearchDetails = () => {
    // $FlowFixMe
    this.setState({
      searchDetailsOpen: true,
    });
  };

  hideSearchDetails = () => {
    // $FlowFixMe
    this.setState({
      searchDetailsOpen: false,
    });
  };

  // $FlowFixMe
  pushNewSearch = ({matchTerm, matchType}, resetDOMFields = true) => {
    this.props.pushNewSearch({matchTerm, matchType});
    // $FlowFixMe
    this.inputRef.setMatch({matchTerm, matchType}, resetDOMFields);
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
          // $FlowFixMe
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
