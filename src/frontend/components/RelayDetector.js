/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
    console.log('this.state.isRelayPresent', this.state.isRelayPresent);
    if (this.state.isRelayPresent) {
      return <div className="relay-detector">{this.props.children}</div>;
    }

    return null;
    // (
    //   <div className="relay-detector placeholder">Looking for Relay...</div>
    // );
  }
}
