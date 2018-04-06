/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {loadRecordDescs} from '../fetch-actions/storeExplorer';
import {loadUpdates} from '../fetch-actions/updatesViewActions';
import {
  loadRecord,
  loadTypeMapping,
} from '../fetch-actions/recordInspectorActions';

export default function({storeExplorer, recordInspector}) {
  const actions = [];

  // storeExplorer
  actions.push(loadRecordDescs(storeExplorer.latest));

  // updatesView
  actions.push(loadUpdates());

  // recordInspector
  Object.keys(recordInspector.fetchedRecords).forEach(id =>
    actions.push(loadRecord(id, true)),
  );
  actions.push(loadTypeMapping());

  return actions;
}
