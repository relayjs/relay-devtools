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

// $FlowFixMe
export default function getTabs(event) {
  const tabs = {};

  // Only include query & variables tabs for a network operation.
  if (event.operation) {
    tabs.query = 'Query';
    tabs.variables = 'Variables';
  }

  // Only include storeDiff tab if it is present on the event.
  if (event.snapshotAfter) {
    tabs.storeDiff = 'Store Update';
  }

  // Only include response tab if it is present on the event.
  if (event.response) {
    tabs.response = 'Response';
  }

  return tabs;
}
