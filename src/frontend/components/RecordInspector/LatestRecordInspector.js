/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
