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
  constructor(props) {
    super(props);

    const persistedSearches = window.localStorage.getItem(
      SAVED_SEARCHES_PERSIST_KEY,
    );
    const savedSearches = persistedSearches
      ? JSON.parse(persistedSearches)
      : [];

    this.state = {
      matchTerm: '',
      matchType: 'idtype',
      savedSearches,
      searchDetailsOpen: false,
    };

    this.inputRef = null;
    this.typeSelectRef = null;
    this.pushNewSearch = this.props.pushNewSearch;
  }

  getMatch() {
    return {
      matchType: this.state.matchType,
      matchTerm: this.state.matchTerm,
    };
  }

  setMatch({matchTerm, matchType}, resetDOMFields = true) {
    this.setState({
      matchTerm,
      matchType,
    });

    if (resetDOMFields) {
      this._setDOMNodes(matchTerm, matchType);
    }
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

  pushNewSearch = ({matchTerm, matchType}, resetDOMFields = true) => {
    this.props.pushNewSearch({matchTerm, matchType});
    this.inputRef.setMatch({matchTerm, matchType}, resetDOMFields);
  };

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
    const {matchTerm, matchType} = this.state;
    const savedSearches = [...this.state.savedSearches, {matchTerm, matchType}];
    window.localStorage.setItem(
      SAVED_SEARCHES_PERSIST_KEY,
      JSON.stringify(savedSearches),
    );

    this.setState({
      savedSearches,
    });
  };

  handleUnsaveSearch = () => {
    this.unsaveSearch(this.state);
  };

  unsaveSearch = ({matchTerm, matchType}) => {
    const savedSearches = this.state.savedSearches.filter(
      s => s.matchTerm !== matchTerm && s.matchType === matchType,
    );
    window.localStorage.setItem(
      SAVED_SEARCHES_PERSIST_KEY,
      JSON.stringify(savedSearches),
    );

    this.setState({
      savedSearches,
    });
  };

  isSearchSaved = ({matchTerm, matchType}) => {
    return Boolean(
      this.state.savedSearches.find(
        s => s.matchTerm === matchTerm && s.matchType === matchType,
      ),
    );
  };

  handleSearchChange = () => {
    // this.pushNewSearch(
    //   {
    //     matchTerm: this.inputRef.value,
    //     matchType: 'idtype',
    //     // this.typeSelectRef.options[
    //     //   this.typeSelectRef.selectedIndex
    //     // ].getAttribute('data-option-name'),
    //   },
    //   false,
    // );
    this.props.handleChange(this.inputRef.value);
  };

  _setDOMNodes = (matchTerm, matchType) => {
    this.inputRef.value = matchTerm;
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
