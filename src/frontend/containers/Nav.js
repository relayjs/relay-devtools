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
import Nav from '../components/Nav';

const mapStateToProps = ({
  storeExplorer,
  tools,
  updatesView,
  environments,
}) => ({
  currentTool: tools.currentTool,
  viewType: updatesView.viewType,
  notifications: {
    updates: updatesView.newNotifications,
  },
  gcData: storeExplorer.gcData,
  ...environments,
});
const mapDispatchToProps = dispatch => ({
  onSwitch: tool => {
    dispatch({
      type: 'SWITCH_TOOL',
      tool,
    });
  },
  onChange: (environment: string) => {
    dispatch({
      type: 'SWITCH_ENVIRONMENT',
      environment,
    });
  },
  onChangeUpdateView: (viewType: string) => {
    dispatch({
      type: 'SWITCH_UPDATE_VIEW',
      viewType,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Nav);
