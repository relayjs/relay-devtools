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
import {loadUpdates} from '../fetch-actions/updatesViewActions';
import UpdatesView from '../components/UpdatesView';

const mapStateToProps = ({tools, updatesView, environments}) => ({
  ...updatesView,
  currentTool: tools.currentTool,
  currentEnvironment: environments.currentEnvironment,
});
const mapDispatchToProps = dispatch => ({
  refetchEvents() {
    dispatch(loadUpdates());
  },

  clearEvents() {
    dispatch({
      type: 'UPDATES_VIEW_CLEAR_EVENTS',
    });
  },

  selectEvent(event) {
    dispatch({
      type: 'UPDATES_VIEW_SELECT_EVENT',
      event,
    });
  },

  changeSplitType(splitType) {
    dispatch({
      type: 'UPDATES_VIEW_CHANGE_SPLIT_TYPE',
      splitType,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdatesView);
