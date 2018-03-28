/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import debounce from 'debounce';

import '../css/Search.less';

const SAVED_SEARCHES_PERSIST_KEY = 'RELAY_DEVTOOLS_SAVED_SEARCHES';

export default class Search extends React.Component {
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

    this.props.rref(this);
  }

  render() {
    const saveSearchButton = this.isSearchSaved(this.state) ? (
      <i
        className="star-button unstar fa fa-fw fa-star"
        onClick={this.handleUnsaveSearch}
      />
    ) : (
      <i
        className="star-button fa fa-fw fa-star-o"
        onClick={this.handleSaveSearch}
      />
    );

    return (
      <div className="search">
        <input
          type="text"
          className="prompt"
          placeholder="Search records…"
          onFocus={this.showSearchDetails}
          onChange={debounce(this.handleSearchChange, 200)}
          ref={input => (this.inputRef = input)}
        />
        <i className="search-icon fa fa-fw fa-search" />
        {saveSearchButton}
        <div className="search-details" hidden={!this.state.searchDetailsOpen}>
          {this.state.savedSearches.map(this.makeSavedSearchElement)}
          <div className="search-config">
            <label>Search by </label>
            <select
              defaultValue="ID & Type"
              ref={select => (this.typeSelectRef = select)}
              onChange={this.handleSearchChange}>
              <option data-option-name="idtype">ID & Type</option>
              <option data-option-name="id">ID</option>
              <option data-option-name="type">Type</option>
            </select>
          </div>
        </div>
      </div>
    );
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
    this.pushNewSearch(
      {
        matchTerm: this.inputRef.value,
        matchType: this.typeSelectRef.options[
          this.typeSelectRef.selectedIndex
        ].getAttribute('data-option-name'),
      },
      false,
    );
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
}
