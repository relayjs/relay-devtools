/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import EnvironmentChooser from '../components/EnvironmentChooser';

const mapStateToProps = ({ environments }) => environments;
const mapDispatchToProps = dispatch => ({
  onChange: environment => {
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

export default connect(mapStateToProps, mapDispatchToProps)(EnvironmentChooser);
