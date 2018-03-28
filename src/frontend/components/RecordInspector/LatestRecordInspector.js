/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

import RecordInspector from './RecordInspector';
import LatestRecordFields from '../../containers/LatestRecordFields';

export default class LatestRecordInspector extends RecordInspector {
  componentDidMount() {
    this.props.loadTypeMapping();
  }

  renderToolbar() {
    return null;
  }

  renderRecordFields(path) {
    const {pathOpened} = this.props;
    return <LatestRecordFields path={path} pathOpened={pathOpened} />;
  }
}
