/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
