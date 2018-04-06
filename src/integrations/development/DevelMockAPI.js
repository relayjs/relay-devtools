/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
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

  async getRecord({id}) {
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
      bestFriend: {__ref: 'client:id200'},
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
    return {
      id100: 'User',
      id200: 'User',
      id300: 'User',
      id110: 'User',
      id111: 'User',
      id112: 'User',
      id113: 'User',
      'client:id100': 'User',
      'client:id101': 'User',
      'client:id102': 'User',
      'client:id200': 'User',
    };
  }

  async getRecords() {
    return {
      id100: 'User',
      id200: 'User',
      id300: 'User',
    };
  }

  onChange({callback}) {
    const interval = setInterval(callback, 3000);
    intervals.push(interval);
  }

  stopObservingChange() {
    intervals.forEach(clearInterval);
    intervals = [];
  }

  async getUpdateEvents() {
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
      snapshotBefore[id] = await this.getRecord({id});
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
      snapshotAfter[id] = await this.getRecord({id});
      if (id === 'id200') {
        snapshotAfter[id].name = 'Jane Doe';
      }
    });

    const mutationText = `
mutation ChangeTodoStatusMutation(
  $input: ChangeTodoStatusInput!
) {
  changeTodoStatus(input: $input) {
    todo {
      id
      complete
    }
    viewer {
      id
      completedCount
    }
  }
}`.trim();

    const mutation = {
      name: 'ChangeTodoStatusMutation',
      query: {operation: 'mutation'},
      text: mutationText,
    };

    const variables = {input: {complete: true, id: 'VG9kbzox'}};

    const query = {
      name: 'GetTodoQuery',
      query: {operation: 'query'},
      text: 'query GetTodoQuery { todos }',
    };

    return [
      {
        seriesId: 'A',
        eventName: 'Response',
        operation: query,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'B',
        eventName: 'Apply Optimistic Update',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'B',
        eventName: 'Commit Payload',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'C',
        eventName: 'Apply Optimistic Update',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'D',
        eventName: 'Apply Optimistic Update',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'C',
        eventName: 'Commit Payload',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
      {
        seriesId: 'D',
        eventName: 'Commit Payload',
        operation: mutation,
        variables,
        snapshotBefore,
        snapshotAfter,
      },
    ];
  }

  hasDetectedRelay() {
    return Promise.resolve(true);
  }

  onRegister(callback) {
    callback();
  }
}
