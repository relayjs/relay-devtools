/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {connect} from 'react-redux';
import Nav from '../components/Nav';

const mapStateToProps = ({
  storeExplorer,
  tools,
  updatesView,
  environments
}) => ({
  currentTool: tools.currentTool,
  notifications: {
    updates: updatesView.newNotifications ? 1 : 0,
  },
  gcData: storeExplorer.gcData,
  ...environments
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Nav);
