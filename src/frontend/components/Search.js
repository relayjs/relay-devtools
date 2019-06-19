/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

'use strict';

import React from 'react';

export default class Search extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  constructor(props) {
    super(props);

    // $FlowFixMe
    this.state = {
      matchTerm: '',
      matchType: 'idtype',
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
    this.pushNewSearch(
      {
        // $FlowFixMe
        matchTerm: this.inputRef.value,
        matchType: 'idtype',
      },
      false,
    );
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
          placeholder="Filter records..."
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
