/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import { LatestRecordInspector } from '../components/RecordInspector';
import { mapDispatchToProps as mapDispatch } from './RecordInspector';
import { loadTypeMapping } from '../fetch-actions/recordInspectorActions';

const mapStateToProps = ({ recordInspector }) => recordInspector;

const mapDispatchToProps = (dispatch, props) => ({
  ...mapDispatch(dispatch, props),

  loadTypeMapping() {
    dispatch(loadTypeMapping());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  LatestRecordInspector,
);
