/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
// eslint-disable-next-line max-len
import LatestRecordInspector from '../components/RecordInspector/LatestRecordInspector';
import {loadTypeMapping} from '../fetch-actions/recordInspectorActions';

const mapStateToProps = ({
  recordInspector,
  storeExplorer,
  environments,
  updatesView,
}) => ({
  currentEnvironment: environments.currentEnvironment,
  id: storeExplorer.selectedRecordId,
  typeMapping: recordInspector.typeMapping,
  pathOpened: recordInspector.pathOpened,
  events: updatesView.events,
});

const mapDispatchToProps = dispatch => ({
  openOrClosePath(path, open) {
    dispatch({
      type: 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH',
      path,
      open,
    });
  },
  loadTypeMapping() {
    dispatch(loadTypeMapping());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LatestRecordInspector);
