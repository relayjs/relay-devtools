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

import {deepObjectEqual} from './objCompare';

// Return only records affected by the change in the following order:
// - added records
// - removed records
// - changed records
// $FlowFixMe
export default function changedRecords(snapshotBefore, snapshotAfter) {
  const added = {};
  const removed = {};
  const changed = {};

  Object.keys(snapshotBefore).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotBefore[key];
    if (record) {
      if (!snapshotAfter[key]) {
        removed[record.__id] = record.__typename;
      } else if (!deepObjectEqual(record, snapshotAfter[key])) {
        changed[record.__id] = record.__typename;
      }
    }
  });

  Object.keys(snapshotAfter).forEach(key => {
    if (key.startsWith('client:')) {
      return;
    }

    const record = snapshotAfter[key];
    if (record) {
      if (!snapshotBefore[key]) {
        added[record.__id] = record.__typename;
      }
    }
  });

  return {...added, ...removed, ...changed};
}
