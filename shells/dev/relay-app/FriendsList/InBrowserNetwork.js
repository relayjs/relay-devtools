// @flow

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
function guid(prefix) {
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

class User {
  +__typename: 'User';
  +id: string;
  +name: string;

  #gender: 'male' | 'female';
  #profilePicture: {|
    +url: string,
  |};
  #friends: $ReadOnlyArray<User>;

  constructor(id) {
    this.__typename = 'User';
    this.id = id == null ? guid('user') : id;
    this.#gender = chance.pick(['male', 'female']);
    this.name = chance.name({
      gender: this.#gender,
    });
  }

  profilePicture() {
    if (!this.#profilePicture) {
      this.#profilePicture = {
        url: `https://randomuser.me/api/portraits/thumb/${
          this.#gender == 'female' ? 'women' : 'men'
        }/${Math.floor(Math.random() * 100)}.jpg`,
      };
    }
    return this.#profilePicture;
  }

  friends() {
    if (!this.#friends) {
      this.#friends = [];
      for (let i = 0; i < 4; i++) {
        this.#friends = this.#friends.concat([createUser()]);
      }
    } else {
      this.#friends = this.#friends.concat([createUser()]);
    }
    return createConnection(this.#friends);
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

function createConnection(nodes) {
  return {
    count: nodes.length + 1,
    edges: nodes.map((node, index) => ({
      cursor: index,
      node,
    })),
    pageInfo: () => mockPageInfo(),
  };
}

const userMap = new Map();
function createUser(id) {
  const user = new User(id);
  userMap.set(user.id, user);
  return user;
}

const root = {
  node: ({ id }) => {
    if (!userMap.has(id)) {
      return createUser(id);
    }
    return userMap.get(id);
  },
};

function fetchQuery(request, variables) {
  return graphql(schema, request.text, root, null, variables);
}

export default Network.create(fetchQuery);
