/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
// eslint-disable-next-line max-len
import LatestRecordFields from '../components/RecordInspector/LatestRecordFields';
import {loadRecord} from '../fetch-actions/recordInspectorActions';

const mapStateToProps = ({recordInspector}) => recordInspector;

const mapDispatchToProps = dispatch => ({
  loadRecord(id) {
    dispatch(loadRecord(id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LatestRecordFields);
