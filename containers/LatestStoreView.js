/**
 * Copyright (c) 2017-present, Facebook, Inc. * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import { LatestStoreView } from '../components/StoreView';
import { loadRecordDescs } from '../fetch-actions/storeExplorer';

const mapStateToProps = ({ storeExplorer }) => ({
  records: storeExplorer.recordDescs,
});

const mapDispatchToProps = (dispatch, props) => ({
  refetchRecords() {
    const { matchType, matchTerm } = props;

    dispatch(loadRecordDescs({ matchType, matchTerm }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LatestStoreView);
