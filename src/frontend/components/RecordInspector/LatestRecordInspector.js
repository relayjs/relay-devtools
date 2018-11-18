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

import {stringifyPath} from '../../util/stringifyPath';
import LatestRecordFields from '../../containers/LatestRecordFields';
// import changedRecords from '../../util/changedRecords';
// import SnapshotStoreView from '../../containers/SnapshotStoreView';

export default class LatestRecordInspector extends React.Component<$FlowFixMe> {
  // $FlowFixMe
  constructor(props, context) {
    super(props, context);

    const {id} = this.props;

    // $FlowFixMe
    this.state = {
      path: [{id, name: id}],
      lastId: props.id,
    };
  }

  componentDidMount() {
    this.props.loadTypeMapping();
  }

  // $FlowFixMe
  getType = id => {
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
  renderRecordFields(path) {
    // const {pathOpened} = this.props;

    if (!path) {
      return <div />;
    }
    return <LatestRecordFields path={path} />;
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
    return null;
  }

  // getEvents(event) {
  //   const {snapshotBefore, snapshotAfter} = event;
  //   const records = changedRecords(snapshotBefore, snapshotAfter);

  //   return (
  //     <div className="store-diff">
  //       <SnapshotStoreView
  //         records={records}
  //         snapshotBefore={snapshotBefore}
  //         snapshotAfter={snapshotAfter}
  //       />
  //     </div>
  //   );
  // }

  render() {
    const {id} = this.props;
    // $FlowFixMe
    const {path} = this.state;

    if (!id) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '20px',
            color: '#ccc',
          }}>
          Select a record to display
        </div>
      );
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
      <div
        className="record-inspector"
        style={{width: '100%', padding: '10px', overflow: 'auto'}}>
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
        {/* this.props.events &&
          this.props.events.length > 0 &&
        this.getEvents(this.props.events[0]) */}
      </div>
    );
  }
}

// In order to avoid passing down functions recursively all over the place, use
// context as a hack.
LatestRecordInspector.childContextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  openOrClosePath: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};
