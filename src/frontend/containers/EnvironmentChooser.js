/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import {connect} from 'react-redux';
import EnvironmentChooser from '../components/EnvironmentChooser';

const mapStateToProps = ({environments}) => ({
  currentEnvironment: environments.currentEnvironment,
  environments: environments.environments,
});

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
  loadEnvironmentsDetails: () => {
    dispatch({
      types: [
        'LOAD_ENVIRONMENTS_DETAILS_REQUEST',
        'LOAD_ENVIRONMENTS_DETAILS_SUCCESS',
        'LOAD_ENVIRONMENTS_DETAILS_FAILURE',
      ],
      callAPI: API => API.getEnvironmentsDetails(),
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnvironmentChooser);
