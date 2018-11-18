/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import '../../css/RecordInspector.less';

import React from 'react';
import PropTypes from 'prop-types';

import RecordFields from '../RecordFields';
import {stringifyPath} from '../../util/stringifyPath';
import InlineDiffRecordFields from '../RecordFields/InlineDiffRecordFields';

export default class SnapshotRecordInspector extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  constructor(props, context) {
    super(props, context);

    const {id} = this.props;

    // $FlowFixMe
    this.state = {
      path: [{id, name: id}],
      lastId: id,
    };
  }

  // $FlowFixMe
  getType = id => {
    const {snapshotBefore, snapshotAfter} = this.props;
    const record = snapshotBefore[id] || snapshotAfter[id];
    if (record) {
      return record.__typename;
    }
    const {typeMapping} = this.props;
    return typeMapping[id];
  };

  // $FlowFixMe
  openOrClosePath = path => {
    const stringified = stringifyPath(path);
    const opened = this.props.pathOpened[stringified];
    this.props.openOrClosePath(stringified, !opened);
  };

  // $FlowFixMe
  navigateToPath = path => {
    // $FlowFixMe
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

  // $FlowFixMe
  componentWillReceiveProps({id}) {
    // $FlowFixMe
    this.setState({
      path: [{id, name: id}],
    });
  }
  // $FlowFixMe
  static getDerivedStateFromProps(props, state) {
    const {id} = props;
    const currentPath = [{id, name: id}];

    if (currentPath !== state.path) {
      const {id} = props;
      return {
        path: currentPath,
        // lastId: props.id,
      };
    }

    // Return null to indicate no change to state.
    return null;
  }

  // $FlowFixMe
  renderRecordFields(path) {
    const {snapshotBefore, snapshotAfter, diffMode, pathOpened} = this.props;
    const {id} = path[path.length - 1];

    if (diffMode !== 'inline' || !snapshotAfter[id]) {
      return (
        <div className="snapshot-record-inspector">
          <div className="before record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotBefore}
              otherSnapshot={snapshotAfter}
            />
          </div>
          <div className="after record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotAfter}
              otherSnapshot={snapshotBefore}
            />
          </div>
        </div>
      );
    }

    return (
      <InlineDiffRecordFields
        path={path}
        pathOpened={pathOpened}
        snapshot={snapshotAfter}
        otherSnapshot={snapshotBefore}
      />
    );
  }

  renderNav() {
    // $FlowFixMe
    const {path} = this.state;

    const makePathElement = ({id, name}, i) => {
      const handler = () => {
        // $FlowFixMe
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
      <div
        className="tag"
        key="tag"
        style={{background: 'white', padding: '4px', marginRight: '20px'}}>
        {tag}
      </div>
    );
  }

  renderToolbar() {
    const {tag} = this.props;

    if (tag !== 'Changed') {
      return this.renderTag();
    }

    const {diffMode, switchDiffMode} = this.props;
    const toolbarEl = this.renderTag();
    const onClick = mode => () => switchDiffMode(mode);
    const viewModeButtons = (
      <div className="button-group view-mode-buttons" key="buttons">
        <button
          className="inline"
          disabled={diffMode === 'inline'}
          onClick={onClick('inline')}>
          Inline
        </button>
        <button
          className="split"
          disabled={diffMode !== 'inline'}
          onClick={onClick('split')}>
          Split
        </button>
      </div>
    );
    return [viewModeButtons, toolbarEl];
  }

  render() {
    const {id} = this.props;
    // $FlowFixMe
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
      <div className="record-inspector" style={{width: '100%'}}>
        {this.props.tag && (
          <div
            className="toolbar"
            style={{
              background: 'rgb(245, 245, 245)',
              height: '40px',
              alignItems: 'center',
              width: '100%',
            }}>
            {this.renderToolbar()}
          </div>
        )}
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
SnapshotRecordInspector.childContextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  openOrClosePath: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};
