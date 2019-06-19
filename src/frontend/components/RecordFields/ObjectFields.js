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
import Header from './Header';

// $FlowFixMe
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
