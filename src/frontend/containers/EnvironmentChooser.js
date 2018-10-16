/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import EnvironmentChooser from '../components/EnvironmentChooser';

const mapStateToProps = ({environments}) => {
  return {
    environments: environments.environments,
    currentEnvironment: environments.currentEnvironment,
    environmentList: environments.environmentList,
  };
};
const mapDispatchToProps = dispatch => ({
  onChange: (environment: string) => {
    dispatch({
      type: 'SWITCH_ENVIRONMENT',
      environment,
    });
  },
  loadEnvironments: () => {
    dispatch({
      types: [
        'LOAD_ENVIRONMENTS_REQUEST',
        'LOAD_ENVIRONMENTS_SUCCESS',
        'LOAD_ENVIRONMENTS_FAILURE',
      ],
      callAPI: API => API.getEnvironments(),
    });
  },
  subscribeEnvironment: environment => {
    dispatch({
      type: 'ENVIRONMENT_SUBSCRIBE',
      environment,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnvironmentChooser);
