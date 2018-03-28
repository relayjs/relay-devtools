/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import Header from './Header';

export default function ObjectFields({value}) {
  if (value === null || typeof value !== 'object') {
    return <Header value={value} />;
  }
  const obj = value;
  let header;
  let body;

  return (
    <ul>
      {Object.keys(value).map(key => {
        const subValue = obj[key];
        if (subValue === null || typeof subValue !== 'object') {
          header = <Header value={subValue} keyName={key} />;
          body = null;
        } else {
          header = <Header keyName={key} />;
          body = <ObjectFields value={subValue} />;
        }
        return (
          <li key={key}>
            {header}
            {body}
          </li>
        );
      })}
    </ul>
  );
}
