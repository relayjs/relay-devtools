/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';

import type {Path} from './RecordFields';

type Props = {|
  path: Path,
  header: React$Node,
  children: React$Node,
|};

export default class Collapsable extends React.Component<Props> {
  static contextTypes = {
    isPathOpened: PropTypes.func,
    openOrClosePath: PropTypes.func,
  };

  render() {
    const {path, children, header} = this.props;
    const opened = Boolean(this.context.isPathOpened(path));

    const childrenElements = opened ? children : null;
    return (
      <div className="collapsable">
        <span
          className="collapse-button"
          data-opened={opened}
          onClick={this._toggle}>
          {header}
        </span>
        {childrenElements}
      </div>
    );
  }

  _toggle = e => {
    this.context.openOrClosePath(this.props.path);
    e.stopPropagation();
  };
}
