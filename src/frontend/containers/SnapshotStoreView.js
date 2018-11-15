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

import SnapshotStoreView from '../components/StoreView/SnapshotStoreView';
import {loadRecordDescs} from '../fetch-actions/storeExplorer';

// import { createSelector } from 'reselect'
// const getLatest = (state) => state.latest;
// const getMatchTerm = (state) => state.matchTerm;
// const getMatchType = (state) => state.matchType;

const mapStateToProps = ({storeExplorer}) => ({
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
)(SnapshotStoreView);
