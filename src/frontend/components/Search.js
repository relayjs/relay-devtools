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

export default class Search extends React.Component<$FlowFixMe> {
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

  // $FlowFixMe
  makeSavedSearchElement = ({matchTerm, matchType}) => {
    function unsave() {
      this.unsaveSearch({matchTerm, matchType});
    }
    return (
      <div key={`${matchTerm}|${matchType}`} className="saved-search">
        <a href="#" onClick={() => this.pushNewSearch({matchTerm, matchType})}>
          {matchTerm}
        </a>
        <i
          className="star-button unstar fa fa-fw fa-star"
          onClick={unsave.bind(this)}
        />
      </div>
    );
  };

  handleSaveSearch = () => {
    // $FlowFixMe
    const {matchTerm, matchType} = this.state;
    // $FlowFixMe
    const savedSearches = [...this.state.savedSearches, {matchTerm, matchType}];
    window.localStorage.setItem(
      SAVED_SEARCHES_PERSIST_KEY,
      JSON.stringify(savedSearches),
    );

    // $FlowFixMe
    this.setState({
      savedSearches,
    });
  };

  handleUnsaveSearch = () => {
    // $FlowFixMe
    this.unsaveSearch(this.state);
  };

  // $FlowFixMe
  unsaveSearch = ({matchTerm, matchType}) => {
    // $FlowFixMe
    const savedSearches = this.state.savedSearches.filter(
      s => s.matchTerm !== matchTerm && s.matchType === matchType,
    );
    window.localStorage.setItem(
      SAVED_SEARCHES_PERSIST_KEY,
      JSON.stringify(savedSearches),
    );

    // $FlowFixMe
    this.setState({
      savedSearches,
    });
  };

  // $FlowFixMe
  isSearchSaved = ({matchTerm, matchType}) => {
    return Boolean(
      // $FlowFixMe
      this.state.savedSearches.find(
        s => s.matchTerm === matchTerm && s.matchType === matchType,
      ),
    );
  };

  handleSearchChange = () => {
    this.pushNewSearch(
      {
        // $FlowFixMe
        matchTerm: this.inputRef.value,
        matchType: 'idtype',
        // this.typeSelectRef.options[
        //   this.typeSelectRef.selectedIndex
        // ].getAttribute('data-option-name'),
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
