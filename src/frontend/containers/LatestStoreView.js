/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import {LatestStoreView} from '../components/StoreView';
import {loadRecordDescs} from '../fetch-actions/storeExplorer';

const mapStateToProps = ({storeExplorer, environments}) => ({
  currentEnvironment: environments.currentEnvironment,
  records: storeExplorer.recordDescs,
});

const mapDispatchToProps = (dispatch, props) => ({
  refetchRecords() {
    const {matchType, matchTerm} = props;

    dispatch(loadRecordDescs({matchType, matchTerm}));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LatestStoreView);
