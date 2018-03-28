/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import onClickOutside from 'react-onclickoutside';

import LatestStoreView from '../containers/LatestStoreView';
import Search from './Search';

const HidableSearch = onClickOutside(Search);

import '../css/StoreExplorer.less';
import '../css/panels.less';

export default class StoreExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.searchRef = null;
  }

  render() {
    const {matchTerm, matchType} = this.props.latest;

    return (
      <div className="store-explorer">
        <div className="panel">
          <div className="left-panel">
            <button
              className="back-button"
              onClick={this.goBack}
              disabled={!this.canGoBack()}>
              ▶
            </button>
            <button
              className="forwardbutton"
              onClick={this.goForward}
              disabled={!this.canGoForward()}>
              ▶
            </button>
          </div>
          <div className="center-panel">
            <HidableSearch
              rref={ref => (this.searchRef = ref)}
              pushNewSearch={this.pushNewSearch}
            />
          </div>
          <div className="right-panel" />
        </div>
        <LatestStoreView matchTerm={matchTerm} matchType={matchType} />
      </div>
    );
  }

  pushNewSearch = ({matchTerm, matchType}, resetDOMFields = true) => {
    this.props.pushNewSearch({matchTerm, matchType});
    this.searchRef.setMatch({matchTerm, matchType}, resetDOMFields);
  };

  canGoBack = () => {
    return this.props.history.back.length !== 0;
  };

  canGoForward = () => {
    return this.props.history.forward.length !== 0;
  };

  goBack = () => {
    const {history} = this.props;
    const currentSearch = this.searchRef.getMatch();
    const newMatch = history.back[history.back.length - 1];
    this.props.goBack(currentSearch);
    this.searchRef.setMatch(newMatch);
  };

  goForward = () => {
    const {history} = this.props;
    const currentSearch = this.searchRef.getMatch();
    const newMatch = history.forward[history.forward.length - 1];
    this.props.goForward(currentSearch);
    this.searchRef.setMatch(newMatch);
  };
}
