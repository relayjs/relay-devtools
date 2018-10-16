/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Header from './Header';
import Collapsable from './Collapsable';
import AnimateOnChange from 'react-animate-on-change';

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
          console.log('subValue', subValue);
          // header = <Header keyName={key} />;
          body = <ObjectFields value={subValue} />;
          const header = (
            <AnimateOnChange
              baseClassName={'header-container '}
              animationClassName="header-container--updated"
              animate={true}>
              <Header keyName={key} />
              {/* <Header keyName={key} summary={`${array.length} elements`} /> */}
            </AnimateOnChange>
          );
        }
        return (
          <li key={key}>
            <Collapsable header={header}>
              {header}
              {body}
            </Collapsable>
          </li>
        );
      })}
    </ul>
  );
}
