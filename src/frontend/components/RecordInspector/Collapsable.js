/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Collapsable extends React.Component {
  render() {
    const { openOrClosePath, isPathOpened } = this.context;

    const { path, children, header } = this.props;
    const opened = Boolean(isPathOpened(path));

    const flip = e => {
      openOrClosePath(path);
      e.stopPropagation();
    };

    const childrenElements = opened ? children : null;
    return (
      <div className="collapsable">
        <span className="collapse-button" data-opened={opened} onClick={flip}>
          {header}
        </span>
        {childrenElements}
      </div>
    );
  }
}

Collapsable.contextTypes = {
  isPathOpened: PropTypes.func,
  openOrClosePath: PropTypes.func,
};
