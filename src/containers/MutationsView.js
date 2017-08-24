/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import { loadMutations } from '../fetch-actions/mutationsViewActions';
import MutationsView from '../components/MutationsView';

const mapStateToProps = ({ mutationsView }) => mutationsView;
const mapDispatchToProps = dispatch => ({
  refetchEvents() {
    dispatch(loadMutations());
  },

  startRecordingEvents() {
    dispatch({
      type: 'START_RECORDING_EVENTS',
      callAPI: (API, environment) =>
        API.startRecordingMutations({ environment }),
    });
  },

  stopRecordingEvents() {
    dispatch({
      type: 'STOP_RECORDING_EVENTS',
      callAPI: (API, environment) =>
        API.stopRecordingMutations({ environment }),
    });
  },

  clearEvents() {
    dispatch({
      type: 'MUTATIONS_VIEW_CLEAR_EVENTS',
    });
  },

  selectEvent(event) {
    dispatch({
      type: 'MUTATIONS_VIEW_SELECT_EVENT',
      event,
    });
  },

  changeSplitType(splitType) {
    dispatch({
      type: 'MUTATIONS_VIEW_CHANGE_SPLIT_TYPE',
      splitType,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MutationsView);
