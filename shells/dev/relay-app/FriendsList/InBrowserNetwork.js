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

var schema = buildSchema(`
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

function mockPageInfo() {
  return {
    hasPreviousPage: true,
    hasNextPage: true,
    endCursor: 'todo',
    startCursor: 'todo',
  };
}

function mockFriendsEdge() {
  return {
    cursor: 'cursor',
    node: mockUser,
  };
}

function mockProfilePicture() {
  const id = Math.floor(Math.random() * 100);
  return {
    url: `https://randomuser.me/api/portraits/thumb/women/${id}.jpg`,
  };
}

function mockFriendsConnection() {
  return {
    count: 10,
    edges: () => [
      mockFriendsEdge(),
      mockFriendsEdge(),
      mockFriendsEdge(),
      mockFriendsEdge(),
    ],
    pageInfo: () => mockPageInfo(),
  };
}

function mockUser() {
  const id = guid('user');
  return {
    __typename: 'User',
    id,
    name: chance.name(),
    profilePicture: mockProfilePicture,
    friends: mockFriendsConnection,
  };
}

// The root provides a resolver function for each API endpoint
var root = {
  node: args => {
    return mockUser();
  },
};

function fetchQuery(request, variables) {
  return graphql(schema, request.text, root, null, variables);
}

export default Network.create(fetchQuery);
