/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import {connect} from 'react-redux';
import '../css/panels.less';
// $FlowFixMe
import StoreView from '../components/StoreView/StoreView';
import {loadRecordDescs} from '../fetch-actions/storeExplorer';

const mapStateToProps = ({storeExplorer, tools}) => ({
  records: storeExplorer.recordDescs,
  tool: tools.tool,
  matchTerm: storeExplorer.latest.matchTerm,
  matchType: storeExplorer.latest.matchType,
});

const mapDispatchToProps = dispatch => ({
  refetchRecords(matchTerm, matchType) {
    dispatch(loadRecordDescs({matchType, matchTerm}));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StoreView);
