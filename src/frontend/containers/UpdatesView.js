/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import { loadUpdates } from '../fetch-actions/updatesViewActions';
import UpdatesView from '../components/UpdatesView';

const mapStateToProps = ({ updatesView }) => updatesView;
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

export default connect(mapStateToProps, mapDispatchToProps)(UpdatesView);
