/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

describe('Store', () => {
  let Store;
  let Bridge;

  beforeEach(() => {
    Bridge = require('src/bridge').default;
    Store = require('src/devtools/store').default;
  });

  it('should merge records correctly', () => {
    const wall = {
      listen: jest.fn(() => () => {}),
      send: jest.fn(),
    };
    const bridge = new Bridge(wall);
    const store = new Store(bridge);

    // Testing case when oldRecords is null and we just set the map to the newRecords
    store.mergeRecords(1, { user: { __id: 'user', __typename: 'User' } });

    expect(store.getRecords(1)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    // Testing case when newRecords is null/undefined and we don't change anything
    store.mergeRecords(1, null);

    expect(store.getRecords(1)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    store.mergeRecords(1, undefined);

    expect(store.getRecords(1)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    // Testing multiple environments
    store.mergeRecords(2, { user: { __id: 'user', __typename: 'User' } });

    expect(store.getRecords(1)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    expect(store.getRecords(2)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    // Testing multiple records
    store.mergeRecords(1, {
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'some_url',
      },
    });

    expect(store.getRecords(1)).toEqual({
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'some_url',
      },
      user: { __id: 'user', __typename: 'User' },
    });

    //Testing overwriting a record
    store.mergeRecords(1, {
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
    });

    expect(store.getRecords(1)).toEqual({
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      user: { __id: 'user', __typename: 'User' },
    });

    store.mergeRecords(1, {
      Bob: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      Lisa: {
        __id: 'Lisa',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });

    expect(store.getRecords(1)).toEqual({
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      Bob: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      Lisa: {
        __id: 'Lisa',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });

    expect(store.getRecords(2)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    store.mergeRecords(1, {
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        nickname: 'Zuck',
      },
      Bob: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      Lisa: {
        __id: 'Lisa',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });

    expect(store.getRecords(1)).toEqual({
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
        nickname: 'Zuck',
      },
      Bob: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      Lisa: {
        __id: 'Lisa',
        __typename: 'User',
        profile_pic: 'a_different_url',
      },
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });

    expect(store.getRecords(2)).toEqual({
      user: { __id: 'user', __typename: 'User' },
    });

    // Deleting records
    store.mergeRecords(1, {
      Bob: null,
      Lisa: null,
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });

    expect(store.getRecords(1)).toEqual({
      Jonathan: {
        __id: 'Jonathan',
        __typename: 'User',
        profile_pic: 'a_different_url',
        nickname: 'Zuck',
      },
      user: {
        __id: 'user',
        __typename: 'User',
        profile_pic: 'new_url',
      },
    });
  });
});
