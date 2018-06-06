/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {connect} from 'react-redux';
import Tools from '../components/Tools';

const mapStateToProps = ({tools, updatesView}) => {
  return {
    currentTool: tools.currentTool,
    newUpdateNotification: updatesView.newNotifications,
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
)(Tools);
