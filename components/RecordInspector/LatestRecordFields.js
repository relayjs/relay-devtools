/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import RecordFields from './RecordFields';
import ContaineredRecordFields from '../../containers/LatestRecordFields';

export default class LatestRecordFields extends RecordFields {
  componentDidMount() {
    const { path } = this.props;
    const { id } = path[path.length - 1];
    this.props.loadRecord(id);
  }

  componentWillReceiveProps(props) {
    const { path } = props;
    const { id } = path[path.length - 1];
    this.previousRecord = this.props.fetchedRecords[id];
    this.props.loadRecord(id);
  }

  // Due to how "changed" animations are built, it is important to only update
  // this component if something actually changed.
  // Otherwise we are risking to cancel an animation in flight because
  // this.previousRecord is overwritten unecessarily.
  // Ideally we track changes on individual field level.
  shouldComponentUpdate(props) {
    const { path } = props;
    const { id } = path[path.length - 1];
    const record = props.fetchedRecords[id];

    if (!record || record !== this.previousRecord) {
      return true;
    }

    if (props.typeMapping !== this.props.typeMapping) {
      return true;
    }
    if (props.pathOpened !== this.props.pathOpened) {
      return true;
    }

    if (props.path !== this.props.path) {
      return true;
    }

    return false;
  }

  shouldAnimate() {
    const { path, fetchedRecords } = this.props;
    const { id } = path[path.length - 1];
    const record = fetchedRecords[id];
    const { previousRecord } = this;
    return previousRecord ? previousRecord.__id === record.__id : false;
  }

  getSelfClass() {
    return ContaineredRecordFields;
  }
}
