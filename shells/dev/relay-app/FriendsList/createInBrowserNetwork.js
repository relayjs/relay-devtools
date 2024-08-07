/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type { INetwork } from '../../../../node_modules/relay-runtime/network/RelayNetworkTypes';
import type { Variables } from '../../../../node_modules/relay-runtime/util/RelayRuntimeTypes';
import type { RequestParameters } from '../../../../node_modules/relay-runtime/util/RelayConcreteNode';
/**
 * This file implements the Relay "network" as a server running in the browser.
 * This allows the test app to send network requests that can be observed without
 * running a separate server.
 */

import { Network } from 'relay-runtime';
import { graphql, buildSchema } from 'graphql';
import Chance from 'chance';

const chance = new Chance();

let nextID = 1000;
function guid(prefix: string) {
  return `${prefix}-${nextID++}`;
}

const schema = buildSchema(`
  type Query {
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }

  type User implements Node {
    id: ID!
    name: String
    profilePicture: ProfilePicture,
    friends(
      after: ID
      before: ID
      first: Int
      last: Int
    ): FriendsConnection
  }

  type ProfilePicture {
    url: String
  }

  type FriendsConnection {
    count: Int
    edges: [FriendsEdge]
    pageInfo: PageInfo
  }

  type FriendsEdge {
    cursor: String
    node: User
  }

  type PageInfo {
    hasPreviousPage: Boolean
    hasNextPage: Boolean
    endCursor: String
    startCursor: String
  }
`);

function createInBrowserNetwork(): INetwork {
  class User {
    +__typename: 'User';
    +id: string;
    +name: string;

    _gender: 'male' | 'female';
    _profilePicture: {|
      +url: string,
    |};
    _friends: $ReadOnlyArray<User>;

    constructor(id: string | void) {
      this.__typename = 'User';
      this.id = id == null ? guid('user') : id;
      this._gender = chance.pick(['male', 'female']);
      this.name = chance.name({
        gender: this._gender,
      });
    }

    profilePicture(): { +url: string, ... } {
      if (!this._profilePicture) {
        this._profilePicture = {
          url: `https://randomuser.me/api/portraits/thumb/${
            this._gender === 'female' ? 'women' : 'men'
          }/${Math.floor(Math.random() * 100)}.jpg`,
        };
      }
      return this._profilePicture;
    }

    friends(): {
      count: number,
      edges: Array<{ cursor: number, node: User, ... }>,
      pageInfo: () => {
        endCursor: string,
        hasNextPage: boolean,
        hasPreviousPage: boolean,
        startCursor: string,
        ...
      },
      ...
    } {
      if (!this._friends) {
        this._friends = [];
        for (let i = 0; i < 4; i++) {
          this._friends = this._friends.concat([createUser()]);
        }
      } else {
        this._friends = this._friends.concat([createUser()]);
      }
      return createConnection(this._friends);
    }
  }

  function mockPageInfo() {
    return {
      hasPreviousPage: true,
      hasNextPage: true,
      endCursor: 'todo',
      startCursor: 'todo',
    };
  }

  function createConnection(nodes: $ReadOnlyArray<User>) {
    return {
      count: nodes.length + 1,
      edges: nodes.map((node, index) => ({
        cursor: index,
        node,
      })),
      pageInfo: () => mockPageInfo(),
    };
  }

  const userMap = new Map<string, User>();
  function createUser(id: string | void) {
    const user = new User(id);
    userMap.set(user.id, user);
    return user;
  }

  const root = {
    node: ({ id }: { id: string | void }) => {
      if (id == null || !userMap.has(id)) {
        return createUser(id);
      }
      return userMap.get(id);
    },
  };

  function fetchQuery(
    request: RequestParameters,
    variables: Variables
  ): $FlowFixMe {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          graphql({
            schema,
            source: request.text,
            rootValue: root,
            variableValues: variables,
          })
        );
      }, 1000 + Math.round(Math.random() * 1000));
    });
  }

  return Network.create(fetchQuery);
}

export default createInBrowserNetwork;
