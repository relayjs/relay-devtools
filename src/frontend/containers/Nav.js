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

const mapStateToProps = ({storeExplorer, tools, updatesView}) => {
  return {
    currentTool: tools.currentTool,
    newUpdateNotification: updatesView.newNotifications,
    gcData: storeExplorer.gcData,
  };
};
const mapDispatchToProps = dispatch => ({
  onSwitch: tool => {
    dispatch({
      type: 'SWITCH_TOOL',
      tool,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Nav);
