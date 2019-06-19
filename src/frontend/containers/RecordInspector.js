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

// $FlowFixMe
export const mapDispatchToProps = dispatch => ({
  // $FlowFixMe
  openOrClosePath(path, open) {
    dispatch({
      type: 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH',
      path,
      open,
    });
  },
});
