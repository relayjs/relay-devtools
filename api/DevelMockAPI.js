/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
export default class DevelMockAPI {
  static async getEnvironments() {
    return [
      'Relay Modern Environment 1',
      'Relay Modern Environment 2',
      'Relay Modern Environment 3',
      'Relay Modern Environment 4',
    ];
  }

  static async getRecord({ id }) {
    if (!id) {
      return null;
    }
    if (id.startsWith('user:')) {
      return {
        id,
        __typename: 'User',
        name: 'Some real special friend',
        favs: {
          books: ['book a', 'book b', 'book c', 'book d'],
        },
      };
    }
    return {
      id,
      __typename: 'User',
      bestFriend: { __ref: 'user:id200' },
      friends: {
        __refs: ['user:id100', 'user:id101', 'user:id102'],
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

  static async getAllRecordDescriptions() {
    return [
      { id: 'id100', type: 'User' },
      { id: 'id200', type: 'User' },
      { id: 'id300', type: 'User' },
      { id: 'id110', type: 'User' },
      { id: 'id111', type: 'User' },
      { id: 'id112', type: 'User' },
      { id: 'id113', type: 'User' },
      { id: 'user:id100', type: 'User' },
      { id: 'user:id101', type: 'User' },
      { id: 'user:id102', type: 'User' },
      { id: 'user:id200', type: 'User' },
    ];
  }

  static async getRecords() {
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

  static onChange() {
    // noop: nothing ever changes
  }
  static stopObservingChange() {
    // noop
  }
}
