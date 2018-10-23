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
    this.props.loadEnvironmentsDetails();
    this.props.loadEnvironments();
  }

  _getEnvironmentName = (currentEnvironment) => {
    const {
      environmentsDetails,
    } = this.props;

    return (
      environmentsDetails &&
      environmentsDetails.length > 0 &&
      environmentsDetails[currentEnvironment] &&
      environmentsDetails[currentEnvironment]._environment &&
      environmentsDetails[currentEnvironment]._environment.configName ||
      `Environment ${Number(currentEnvironment) + 1}`
    );
  }

  render() {
    const {
      environments,
      environmentsDetails,
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
    // const handleChange = (e: SyntheticEvent<>) => onChange(e.target.value);

    return (
      <div className="environment-chooser">
        <div className="contained">{children}</div>
        {/* <div className="footer">
          <select defaultValue={currentEnvironment} onChange={handleChange}>
            {environments.map(env => <option key={env} value={env}>{this._getEnvironmentName(env)}</option>)}
          </select>
        </div> */}
      </div>
    );
  }
}
