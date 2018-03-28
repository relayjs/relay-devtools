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

import RecordFields, {stringifyPath} from './RecordFields';

export default class RecordInspector extends React.Component {
  constructor(props, context) {
    super(props, context);

    const {id} = this.props;

    this.state = {
      path: [{id, name: id}],
    };
  }

  getType = id => {
    const {typeMapping} = this.props;
    return typeMapping[id];
  };

  openOrClosePath = path => {
    const stringified = stringifyPath(path);
    const opened = this.props.pathOpened[stringified];
    this.props.openOrClosePath(stringified, !opened);
  };

  navigateToPath = path => {
    this.setState({
      path,
    });
  };

  getChildContext() {
    return {
      navigateToPath: this.navigateToPath,
      openOrClosePath: this.openOrClosePath,
      getType: this.getType,
    };
  }

  componentWillReceiveProps({id}) {
    this.setState({
      path: [{id, name: id}],
    });
  }

  // Overridable method
  renderRecordFields(path) {
    const {pathOpened} = this.state;
    return <RecordFields path={path} pathOpened={pathOpened} />;
  }

  renderNav() {
    const {path} = this.state;

    const makePathElement = ({id, name}, i) => {
      const handler = () => {
        this.setState({
          path: path.slice(0, i + 1),
        });
      };

      return (
        <a key={id} onClick={handler}>
          {name}
        </a>
      );
    };

    return <div className="inspector-nav">{path.map(makePathElement)}</div>;
  }

  renderTag() {
    const {tag} = this.props;
    if (!tag) {
      return null;
    }

    return (
      <div className="tag" key="tag">
        {tag}
      </div>
    );
  }

  renderToolbar() {
    return this.renderTag();
  }

  render() {
    const {id} = this.props;
    const {path} = this.state;

    if (!id) {
      return <div className="placeholder">Select a record to display</div>;
    }

    const expand = () => {
      this.navigateToPath(path.slice(0, path.length - 1));
    };

    const ellipsis =
      path.length > 1 ? (
        <div className="ellipsis" onClick={expand}>
          …
        </div>
      ) : null;

    return (
      <div className="record-inspector">
        <div className="toolbar">{this.renderToolbar()}</div>
        {this.renderNav()}
        <div className="root-header">
          {ellipsis}
          <br />
          <span className="link-desc">{this.getType(id)}</span>
        </div>
        {this.renderRecordFields(path)}
      </div>
    );
  }
}

// In order to avoid passing down functions recursively all over the place, use
// context as a hack.
RecordInspector.childContextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  openOrClosePath: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};
