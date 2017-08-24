/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { connect } from 'react-redux';
import StoreExplorer from '../components/StoreExplorer';

const mapStateToProps = ({ storeExplorer }) => storeExplorer;
const mapDispatchToProps = dispatch => ({
  pushNewSearch: newSearch => {
    dispatch({
      type: 'NEW_SEARCH',
      newSearch,
    });
  },
  goBack: currentSearch => {
    dispatch({
      type: 'SEARCH_GO_BACK',
      currentSearch,
    });
  },
  goForward: currentSearch => {
    dispatch({
      type: 'SEARCH_GO_FORWARD',
      currentSearch,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(StoreExplorer);
