/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';

import RecordFields, {NON_EXISTENT} from './RecordFields';
import Header from './Header';

export default class InlineDiffRecordFields extends RecordFields {
  getSelfClass() {
    return InlineDiffRecordFields;
  }

  renderScalar(value, prev, key) {
    const different = value !== prev;

    const valueHeader =
      value !== NON_EXISTENT ? <Header keyName={key} value={value} /> : null;

    const prevHeader =
      prev !== NON_EXISTENT ? <Header keyName={key} value={prev} /> : null;

    if (!different) {
      return <li key={key}>{valueHeader}</li>;
    }

    return (
      <li className="changed" key={key}>
        <div className="header-before">{prevHeader}</div>
        <div className="header-after">{valueHeader}</div>
      </li>
    );
  }
}
