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

import React from 'react';

type Props = {};

type State = {
  isHovered: boolean,
  isPressed: boolean,
};

const Hoverable = (Component: any) => {
  class HoverableImplementation extends React.Component<$FlowFixMe, State> {
    props: Props;
    state: State = {
      isHovered: false,
      isPressed: false,
    };

    render() {
      const {isHovered, isPressed} = this.state;

      return (
        <Component
          {...this.props}
          isHovered={isHovered}
          isPressed={isPressed}
          onMouseDown={this._onMouseDown}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
          onMouseUp={this._onMouseUp}
        />
      );
    }

    _onMouseDown = (): void => {
      this.setState({isPressed: true});
    };

    _onMouseEnter = (): void => {
      this.setState({isHovered: true});
    };

    _onMouseLeave = (): void => {
      this.setState({isHovered: false, isPressed: false});
    };

    _onMouseUp = (): void => {
      this.setState({isPressed: false});
    };
  }

  return HoverableImplementation;
};

export default Hoverable;
