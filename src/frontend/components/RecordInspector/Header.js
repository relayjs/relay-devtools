/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export default function Header(props) {
  const {keyName, focusHandler, value, summary, isLink = false} = props;

  const keyClasses =
    'key-desc' +
    (typeof keyName === 'string' && keyName.startsWith('__')
      ? ' key-deemph'
      : '');

  const keySpan =
    keyName !== undefined ? (
      <span className={keyClasses}>{keyName}:</span>
    ) : null;

  const valueSpanClass = isLink ? 'link-desc' : `value-desc-${typeof value}`;
  const displayValue =
    typeof value === 'string'
      ? value
      : typeof value === 'undefined'
        ? 'undefined'
        : JSON.stringify(value);
  const valueSpan =
    'value' in props ? (
      <span className={valueSpanClass} key="value">
        {displayValue}
      </span>
    ) : null;

  const summarySpan = summary ? (
    <span className="summary-desc" key="summary">
      {summary}
    </span>
  ) : null;

  const valueAndSummary = focusHandler ? (
    <span className="focus-button" onClick={focusHandler}>
      {valueSpan}
      {summarySpan}
    </span>
  ) : (
    [valueSpan, summarySpan]
  );

  return (
    <span className="pretty-printer-header">
      {keySpan}
      {valueAndSummary}
    </span>
  );
}
