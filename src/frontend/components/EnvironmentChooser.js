/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import '../css/EnvironmentChooser.less';

export default class EnvironmentChooser extends React.PureComponent {
  componentDidMount() {
    this.props.loadEnvironments();
  }

  render() {
    const {
      environments,
      currentEnvironment,
      onChange,
      subscribeEnvironment,
      children,
    } = this.props;

    if (!currentEnvironment) {
      return <div className="placeholder">Loading</div>;
    }

    if (!environments.length) {
      return (
        <div className="placeholder">
          No Relay Modern Environments found on the page
        </div>
      );
    }

    subscribeEnvironment(currentEnvironment);

    return (
      <div className="environment-chooser">
        <div className="contained">{children}</div>
        <div className="footer">
          <select defaultValue={currentEnvironment} onChange={onChange}>
            {environments.map(env => <option key={env}>{env}</option>)}
          </select>
        </div>
      </div>
    );
  }
}
