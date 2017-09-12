/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
let intervals = [];
export default class DevelMockAPI {
  async getEnvironments() {
    return [
      'Relay Modern Environment 1',
      'Relay Modern Environment 2',
      'Relay Modern Environment 3',
      'Relay Modern Environment 4',
    ];
  }

  async getRecord({ id }) {
    if (!id) {
      return null;
    }
    if (id.startsWith('client:')) {
      return {
        id,
        __id: id,
        __typename: 'User',
        name: 'Some real special friend',
        favs: {
          books: ['book a', 'book b', 'book c', 'book d'],
        },
      };
    }
    return {
      id,
      __id: id,
      __typename: 'User',
      bestFriend: { __ref: 'client:id200' },
      friends: {
        __refs: ['client:id100', 'client:id101', 'client:id102'],
      },
      name: 'John Doe',
      nested: {
        another: {
          field: 'hi',
        },
        number: 123,
        number1: 0,
      },
    };
  }

  async getAllRecordDescriptions() {
    return [
      { id: 'id100', type: 'User' },
      { id: 'id200', type: 'User' },
      { id: 'id300', type: 'User' },
      { id: 'id110', type: 'User' },
      { id: 'id111', type: 'User' },
      { id: 'id112', type: 'User' },
      { id: 'id113', type: 'User' },
      { id: 'client:id100', type: 'User' },
      { id: 'client:id101', type: 'User' },
      { id: 'client:id102', type: 'User' },
      { id: 'client:id200', type: 'User' },
    ];
  }

  async getRecords() {
    return [
      {
        id: 'id100',
        type: 'User',
      },
      {
        id: 'id200',
        type: 'User',
      },
      {
        id: 'id300',
        type: 'User',
      },
    ];
  }

  onChange({ callback }) {
    const interval = setInterval(callback, 3000);
    intervals.push(interval);
  }

  stopObservingChange() {
    intervals.forEach(clearInterval);
    intervals = [];
  }

  startRecordingMutations() {}

  stopRecordingMutations() {}

  async getRecordedMutationEvents() {
    const snapshotBefore = {};
    const snapshotAfter = {};
    [
      'id100',
      'id200',
      'id300',
      'client:id100',
      'client:id200',
      'client:id102',
      'client:id101',
    ].forEach(async id => {
      snapshotBefore[id] = await this.getRecord({ id });
    });
    [
      'id200',
      'id300',
      'id400',
      'client:id100',
      'client:id200',
      'client:id102',
      'client:id101',
    ].forEach(async id => {
      snapshotAfter[id] = await this.getRecord({ id });
      if (id === 'id200') {
        snapshotAfter[id].name = 'Jane Doe';
      }
    });

    /* eslint-disable max-len */
    const mutationText =
      'mutation ChangeTodoStatusMutation(\n  $input: ChangeTodoStatusInput!\n) {\n  changeTodoStatus(input: $input) {\n    todo {\n      id\n      complete\n    }\n    viewer {\n      id\n      completedCount\n    }\n  }\n}\n';
    /* eslint-enable max-len */

    const mutation = {
      node: {
        name: 'ChangeTodoStatusMutation',
        text: mutationText,
      },
      variables: { input: { complete: true, id: 'VG9kbzox' } },
    };

    return [
      {
        seriesId: '0.000001',
        eventName: 'Apply Optimistic Update',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: '0.000001',
        eventName: 'Commit Payload',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: '0.000002',
        eventName: 'Apply Optimistic Update',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: '0.000003',
        eventName: 'Apply Optimistic Update',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: '0.000002',
        eventName: 'Commit Payload',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: '0.000003',
        eventName: 'Commit Payload',
        mutation,
        snapshotBefore,
        snapshotAfter,
      },
    ];
  }

  hasDetectedRelay() {
    return true;
  }

  onRegister({ callback }) {
    callback();
  }
}
