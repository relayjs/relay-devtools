/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const mapDispatchToProps = dispatch => ({
  openOrClosePath(path, open) {
    dispatch({
      type: 'RECORD_INSPECTOR_OPEN_OR_CLOSE_PATH',
      path,
      open,
    });
  },
});
