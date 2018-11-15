/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import {connect} from 'react-redux';
import LatestRecordFields from '../components/RecordFields/LatestRecordFields';
import {loadRecord} from '../fetch-actions/recordInspectorActions';

const mapStateToProps = ({recordInspector, storeExplorer}) => ({
  selectedRecordId: storeExplorer.selectedRecordId,
  fetchedRecords: recordInspector.fetchedRecords,
  typeMapping: recordInspector.typeMapping,
  pathOpened: recordInspector.pathOpened,
});

const mapDispatchToProps = dispatch => ({
  loadRecord(id) {
    dispatch(loadRecord(id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LatestRecordFields);
