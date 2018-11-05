import {deepObjectEqual} from './objCompare';

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

