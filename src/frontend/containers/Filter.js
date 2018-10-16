/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from 'react-redux';
import Filter from '../components/Filter';

const mapStateToProps = ({storeExplorer}) => storeExplorer;
const mapDispatchToProps = dispatch => ({
  handleFilter: e => {
    console.log(e.target.value);

    dispatch({
      type: 'UPDATE_FILTER',
      filter: e.target.value,
    });
  },
  pushNewSearch: e => {
    console.log(e.target.value);

    dispatch({
      type: 'NEW_SEARCH',
      newSearch: {
        matchTerm: e.target.value,
        matchType: 'id',
      },
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);
