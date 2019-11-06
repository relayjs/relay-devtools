/**
 * @flow
 * @relayHash 5330ca35aecfb330db735a5781ea5e77
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type Friends_user$ref = any;
export type FriendsQueryVariables = {||};
export type FriendsQueryResponse = {|
  +user: ?{|
    +id?: string,
    +$fragmentRefs: Friends_user$ref,
  |}
|};
export type FriendsQuery = {|
  variables: FriendsQueryVariables,
  response: FriendsQueryResponse,
|};
*/

/*
query FriendsQuery {
  user: node(id: "my-id") {
    __typename
    ... on User {
      id
      ...Friends_user
    }
    id
  }
}

fragment Friends_user on User {
  friends(first: 10) {
    count
    edges {
      node {
        id
        ...FriendCard_user
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment FriendCard_user on User {
  name
  profilePicture {
    url
  }
}
*/

const node /*: ConcreteRequest*/ = (function() {
  var v0 = [
      {
        kind: 'Literal',
        name: 'id',
        value: 'my-id',
      },
    ],
    v1 = {
      kind: 'ScalarField',
      alias: null,
      name: 'id',
      args: null,
      storageKey: null,
    },
    v2 = {
      kind: 'ScalarField',
      alias: null,
      name: '__typename',
      args: null,
      storageKey: null,
    },
    v3 = [
      {
        kind: 'Literal',
        name: 'first',
        value: 10,
      },
    ],
    v4 = {
      type: 'String',
      enumValues: null,
      plural: false,
      nullable: true,
    };
  return {
    kind: 'Request',
    fragment: {
      kind: 'Fragment',
      name: 'FriendsQuery',
      type: 'Query',
      metadata: null,
      argumentDefinitions: [],
      selections: [
        {
          kind: 'LinkedField',
          alias: 'user',
          name: 'node',
          storageKey: 'node(id:"my-id")',
          args: (v0 /*: any*/),
          concreteType: null,
          plural: false,
          selections: [
            {
              kind: 'InlineFragment',
              type: 'User',
              selections: [
                (v1 /*: any*/),
                {
                  kind: 'FragmentSpread',
                  name: 'Friends_user',
                  args: null,
                },
              ],
            },
          ],
        },
      ],
    },
    operation: {
      kind: 'Operation',
      name: 'FriendsQuery',
      argumentDefinitions: [],
      selections: [
        {
          kind: 'LinkedField',
          alias: 'user',
          name: 'node',
          storageKey: 'node(id:"my-id")',
          args: (v0 /*: any*/),
          concreteType: null,
          plural: false,
          selections: [
            (v2 /*: any*/),
            (v1 /*: any*/),
            {
              kind: 'InlineFragment',
              type: 'User',
              selections: [
                {
                  kind: 'LinkedField',
                  alias: null,
                  name: 'friends',
                  storageKey: 'friends(first:10)',
                  args: (v3 /*: any*/),
                  concreteType: 'FriendsConnection',
                  plural: false,
                  selections: [
                    {
                      kind: 'ScalarField',
                      alias: null,
                      name: 'count',
                      args: null,
                      storageKey: null,
                    },
                    {
                      kind: 'LinkedField',
                      alias: null,
                      name: 'edges',
                      storageKey: null,
                      args: null,
                      concreteType: 'FriendsEdge',
                      plural: true,
                      selections: [
                        {
                          kind: 'LinkedField',
                          alias: null,
                          name: 'node',
                          storageKey: null,
                          args: null,
                          concreteType: 'User',
                          plural: false,
                          selections: [
                            (v1 /*: any*/),
                            {
                              kind: 'ScalarField',
                              alias: null,
                              name: 'name',
                              args: null,
                              storageKey: null,
                            },
                            {
                              kind: 'LinkedField',
                              alias: null,
                              name: 'profilePicture',
                              storageKey: null,
                              args: null,
                              concreteType: 'ProfilePicture',
                              plural: false,
                              selections: [
                                {
                                  kind: 'ScalarField',
                                  alias: null,
                                  name: 'url',
                                  args: null,
                                  storageKey: null,
                                },
                              ],
                            },
                            (v2 /*: any*/),
                          ],
                        },
                        {
                          kind: 'ScalarField',
                          alias: null,
                          name: 'cursor',
                          args: null,
                          storageKey: null,
                        },
                      ],
                    },
                    {
                      kind: 'LinkedField',
                      alias: null,
                      name: 'pageInfo',
                      storageKey: null,
                      args: null,
                      concreteType: 'PageInfo',
                      plural: false,
                      selections: [
                        {
                          kind: 'ScalarField',
                          alias: null,
                          name: 'endCursor',
                          args: null,
                          storageKey: null,
                        },
                        {
                          kind: 'ScalarField',
                          alias: null,
                          name: 'hasNextPage',
                          args: null,
                          storageKey: null,
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: 'LinkedHandle',
                  alias: null,
                  name: 'friends',
                  args: (v3 /*: any*/),
                  handle: 'connection',
                  key: 'User_friends',
                  filters: null,
                },
              ],
            },
          ],
        },
      ],
    },
    params: {
      operationKind: 'query',
      name: 'FriendsQuery',
      id: null,
      text:
        'query FriendsQuery {\n  user: node(id: "my-id") {\n    __typename\n    ... on User {\n      id\n      ...Friends_user\n    }\n    id\n  }\n}\n\nfragment Friends_user on User {\n  friends(first: 10) {\n    count\n    edges {\n      node {\n        id\n        ...FriendCard_user\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment FriendCard_user on User {\n  name\n  profilePicture {\n    url\n  }\n}\n',
      metadata: {
        relayTestingSelectionTypeInfo: {
          user: {
            type: 'Node',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.id': {
            type: 'ID',
            enumValues: null,
            plural: false,
            nullable: false,
          },
          'user.friends': {
            type: 'FriendsConnection',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.count': {
            type: 'Int',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges': {
            type: 'FriendsEdge',
            enumValues: null,
            plural: true,
            nullable: true,
          },
          'user.friends.pageInfo': {
            type: 'PageInfo',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges.node': {
            type: 'User',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges.node.id': {
            type: 'ID',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges.cursor': (v4 /*: any*/),
          'user.friends.pageInfo.endCursor': (v4 /*: any*/),
          'user.friends.pageInfo.hasNextPage': {
            type: 'Boolean',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges.node.name': (v4 /*: any*/),
          'user.friends.edges.node.profilePicture': {
            type: 'ProfilePicture',
            enumValues: null,
            plural: false,
            nullable: true,
          },
          'user.friends.edges.node.__typename': {
            type: 'String',
            enumValues: null,
            plural: false,
            nullable: false,
          },
          'user.friends.edges.node.profilePicture.url': (v4 /*: any*/),
        },
      },
    },
  };
})();
// prettier-ignore
(node/*: any*/).hash = 'a6b9278522433a2fc15be2fa73724fdb';
module.exports = node;
