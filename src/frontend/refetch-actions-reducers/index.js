/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 * @format
 */

import {loadRecordDescs} from '../fetch-actions/storeExplorer';
import {loadUpdates} from '../fetch-actions/updatesViewActions';
import {
  loadRecord,
  loadTypeMapping,
} from '../fetch-actions/recordInspectorActions';

// $FlowFixMe
export default function({storeExplorer, recordInspector}) {
  const actions = [];

  // storeExplorer

  actions.push(
    loadRecordDescs({
      matchType: storeExplorer.latest.matchType,
      matchTerm: storeExplorer.latest.matchTerm,
    }),
  );

  // updatesView
  actions.push(loadUpdates());

  // recordInspector
  (recordInspector?.fetchedRecords?.allIds || []).forEach(id =>
    actions.push(loadRecord(id)),
  );
  actions.push(loadTypeMapping());

  return actions;
}
