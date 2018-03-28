/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

import React from 'react';

import '../css/RelayDetector.less';

export default class RelayDetector extends React.Component {
  state = {
    isRelayPresent: false,
  };

  componentDidMount() {
    this.props.API.onRegister(() => {
      this.setState({isRelayPresent: true});
    });
    this.props.API.hasDetectedRelay().then(isRelayPresent => {
      this.setState({isRelayPresent});
    });
  }

  render() {
    if (this.state.isRelayPresent) {
      return <div className="relay-detector">{this.props.children}</div>;
    }

    return (
      <div className="relay-detector placeholder">Looking for Relay...</div>
    );
  }
}
