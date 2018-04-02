/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
