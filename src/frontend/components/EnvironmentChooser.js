/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import '../css/EnvironmentChooser.less';

export default class EnvironmentChooser extends React.Component {
  componentDidMount() {
    if (!this.props.environments || this.props.environments.length <= 0) {
      this.props.loadEnvironments();
      this.props.loadEnvironment();
    }
  }

  componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
    if (
      (!prevProps.environments || prevProps.environments.length <= 0) &&
      (!prevProps.currentEnvironment && this.props.currentEnvironment)
    ) {
      this.props.subscribeEnvironment(this.props.currentEnvironment);
    }
  }

  handleChange = (e: SyntheticEvent<>) => {
    this.props.onChange(e.target.value);
  };

  render() {
    const {
      environments,
      environmentList,
      currentEnvironment,
      onChange,
      children,
    } = this.props;

    if (!currentEnvironment) {
      return null;
    }

    if (!environments || environments.length <= 0) {
      return (
        <div className="placeholder">
          No Relay Modern Environments found on the page
        </div>
      );
    }

    let content = environments.map((env, idx) => {
      let title = `${children} ${idx + 1}`;
      console.log(environments, this.props, children);
      if (
        environmentList &&
        environmentList[env] &&
        environmentList[env]._environment &&
        environmentList[env]._environment.configName
      ) {
        title = environmentList[env]._environment.configName;
      }
      return (
        <option value={env} key={env}>
          {title}
        </option>
      );
    });
    return <span />
    // return (
    //   <select
    //     style={{
    //       background: 'rgba(0, 0, 0, 0)',
    //
    //       borderRadius: 0,
    //       border: 0,
    //       outline: 'none',
    //       color: 'black',
    //       appearance: 'none',
    //       WebkitAppearance: 'none',
    //       // fontSize: '14px',
    //     }}
    //     defaultValue={currentEnvironment}
    //     onChange={this.handleChange}>
    //     {content}
    //   </select>
    // );
  }
}
