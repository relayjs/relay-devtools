/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import StoreExplorer from '../components/StoreExplorer';

const mapStateToProps = ({storeExplorer}) => storeExplorer;
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
