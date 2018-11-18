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

export default class RelayDetector extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  state = {
    isRelayPresent: false,
  };

  componentDidMount() {
    this.props.API.onRegister(() => {
      // $FlowFixMe
      this.setState({isRelayPresent: true});
    });
    this.props.API.hasDetectedRelay().then(isRelayPresent => {
      // $FlowFixMe
      this.setState({isRelayPresent});
    });
  }

  render() {
    // $FlowFixMe
    if (this.state.isRelayPresent) {
      return <div>{this.props.children}</div>;
    }

    return <div style={relayDetectorStyle}>Connecting to Relay...</div>;
  }
}

const relayDetectorStyle = {
  display: 'flex',
  height: '100%',
  color: '#ccc',
  justifyContent: 'center',
  fontSize: '30px',
  marginTop: '50px',
};
