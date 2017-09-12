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
  constructor(props) {
    super(props);

    this.state = {
      isRelayPresent: false,
    };

    props.API.onRegister(() => {
      this.setState({ isRelayPresent: true });
    });

    props.API.hasDetectedRelay().then(isRelayPresent => {
      this.setState({ isRelayPresent });
    });
  }

  render() {
    if (this.state.isRelayPresent) {
      return <div>{this.props.children}</div>;
    }

    return <div className="placeholder">Looking for Relay...</div>;
  }
}
