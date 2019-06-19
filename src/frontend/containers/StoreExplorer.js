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
import StoreExplorer from '../components/StoreView';
import {loadRecordDescs} from '../fetch-actions/storeExplorer';

const mapStateToProps = ({storeExplorer, tools, environments}) => ({
  selectedRecordId: storeExplorer.selectedRecordId,
  records: storeExplorer.recordDescs,
  currentTool: tools.currentTool,
  matchTerm: storeExplorer.latest.matchTerm,
  matchType: storeExplorer.latest.matchType,
  currentEnvironment: environments.currentEnvironment,
});

const mapDispatchToProps = dispatch => ({
  refetchRecords(matchTerm, matchType) {
    dispatch(loadRecordDescs({matchType, matchTerm}));
  },
  selectRecordId(id) {
    dispatch({
      type: 'SELECT_RECORD',
      id,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StoreExplorer);
