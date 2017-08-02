/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import React from 'react';
import API from '../api';

import '../css/EnvironmentChooser.less';

export default class EnvironmentChooser extends React.Component {
  constructor() {
    super();
    this.state = {
      environment: null,
      environments: null,
    };

    this.handleChange = this.handleChange.bind(this);

    API.getEnvironments().then((res, err) => {
      if (err) {
        throw err;
      }
      this.setState({
        environment: res[0],
        environments: res,
      });
    });
  }

  render() {
    if (!this.state.environments) {
      return <div className="placeholder">Loading</div>;
    }

    if (!this.state.environments.length) {
      return (
        <div className="placeholder">
          No Relay Modern Environments found on the page
        </div>
      );
    }

    return (
      <div className="environment-chooser">
        <div className="contained">
          {this.renderChildren(this.props.children)}
        </div>
        <div className="footer">
          <select
            defaultValue={this.state.environments[0]}
            onChange={this.handleChange}>
            {this.state.environments.map(env =>
              <option key={env}>
                {env}
              </option>,
            )}
          </select>
        </div>
      </div>
    );
  }

  handleChange(event) {
    this.setState({
      environment: event.target.value,
    });
  }

  renderChildren(children) {
    return React.Children.map(children, child => {
      return React.cloneElement(child, {
        environment: this.state.environment,
      });
    });
  }
}
