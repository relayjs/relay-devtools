/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

export default class RelayDetector extends React.Component {
  constructor() {
    super();

    this.state = {
      isRelayPresent: false,
    };

    setInterval(this.checkForRelay.bind(this), 250);
  }

  checkForRelay() {
    const { API } = this.props;
    API.checkForRelay().then(exists => {
      if (exists !== this.state.isRelayPresent) {
        this.setState({ isRelayPresent: exists });
      }
    });
  }

  render() {
    if (this.state.isRelayPresent) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    return <div className="placeholder">Looking for Relay...</div>;
  }
}
