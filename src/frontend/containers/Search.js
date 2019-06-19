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
import Search from '../components/Search';

const mapStateToProps = ({storeExplorer}) => storeExplorer;
const mapDispatchToProps = dispatch => ({
  pushNewSearch: newSearch => {
    dispatch({
      type: 'NEW_SEARCH',
      newSearch,
    });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Search);
