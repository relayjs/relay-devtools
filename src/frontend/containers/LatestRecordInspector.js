/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import {LatestRecordInspector} from '../components/RecordInspector';
import {mapDispatchToProps as mapDispatch} from './RecordInspector';
import {loadTypeMapping} from '../fetch-actions/recordInspectorActions';

const mapStateToProps = ({recordInspector}) => recordInspector;

const mapDispatchToProps = (dispatch, props) => ({
  ...mapDispatch(dispatch, props),

  loadTypeMapping() {
    dispatch(loadTypeMapping());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  LatestRecordInspector,
);
