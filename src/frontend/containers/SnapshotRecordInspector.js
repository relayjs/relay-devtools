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
// eslint-disable-next-line max-len
import SnapshotRecordInspector from '../components/RecordInspector/SnapshotRecordInspector';

const mapStateToProps = ({recordInspector}) => recordInspector;
const mapDispatchToProps = dispatch => ({
  openOrClosePath(path, open) {
    dispatch({
      type: 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH',
      path,
      open,
    });
  },
  switchDiffMode(diffMode) {
    dispatch({
      type: 'RECORD_INSPECTOR_CHANGE_DIFF_MODE',
      diffMode,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SnapshotRecordInspector);
