/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import React from 'react';

export default class EnvironmentChooser extends React.Component<$FlowFixMe> {
  componentDidMount() {
    this.props.loadEnvironmentsDetails();
    this.props.loadEnvironments();
  }

  // $FlowFixMe
  componentDidUpdate(prevProps) {
    if (
      this.props.currentEnvironment &&
      prevProps.currentEnvironment !== this.props.currentEnvironment
    ) {
      this.props.subscribeEnvironment(this.props.currentEnvironment);
    }
  }

  render() {
    const {environments, currentEnvironment, children} = this.props;

    if (!currentEnvironment) {
      // possible loading state here
      return <div style={relayDetectorStyle}>Connecting to Relay...</div>;
    }

    if (!environments.length) {
      return (
        <div style={relayDetectorStyle}>
          No Relay Modern Environments found on the page
        </div>
      );
    }

    return children;
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
