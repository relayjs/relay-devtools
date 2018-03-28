/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import {connect} from 'react-redux';
import {SnapshotRecordInspector} from '../components/RecordInspector';
import {mapDispatchToProps as mapDispatch} from './RecordInspector';

const mapStateToProps = ({recordInspector}) => recordInspector;

const mapDispatchToProps = (dispatch, props) => ({
  ...mapDispatch(dispatch, props),

  switchDiffMode(diffMode) {
    dispatch({
      type: 'RECORD_INSPECTOR_CHANGE_DIFF_MODE',
      diffMode,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  SnapshotRecordInspector,
);
