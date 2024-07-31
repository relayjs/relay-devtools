/**
 * @generated SignedSource<<c7d5a2ad9ae46e0814c135d3836b0ff6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Friends_user$fragmentType } from "./Friends_user.graphql";
export type FriendsQuery$variables = {||};
export type FriendsQuery$data = {|
  +user: ?{|
    +id?: string,
    +$fragmentSpreads: Friends_user$fragmentType,
  |},
|};
export type FriendsQuery = {|
  response: FriendsQuery$data,
  variables: FriendsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FriendsQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Friends_user"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "FriendsQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "count",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProfilePicture",
                            "kind": "LinkedField",
                            "name": "profilePicture",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "url",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endCursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasNextPage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "friends(first:10)"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "User_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "98f3b773bdfc26cfa52cd8d9bdeed4ca",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "user": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "user.__typename": (v4/*: any*/),
        "user.friends": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FriendsConnection"
        },
        "user.friends.count": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "user.friends.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "FriendsEdge"
        },
        "user.friends.edges.cursor": (v5/*: any*/),
        "user.friends.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "user.friends.edges.node.__typename": (v4/*: any*/),
        "user.friends.edges.node.id": (v6/*: any*/),
        "user.friends.edges.node.name": (v5/*: any*/),
        "user.friends.edges.node.profilePicture": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProfilePicture"
        },
        "user.friends.edges.node.profilePicture.url": (v5/*: any*/),
        "user.friends.pageInfo": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PageInfo"
        },
        "user.friends.pageInfo.endCursor": (v5/*: any*/),
        "user.friends.pageInfo.hasNextPage": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "user.id": (v6/*: any*/)
      }
    },
    "name": "FriendsQuery",
    "operationKind": "query",
    "text": "query FriendsQuery {\n  user: node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      ...Friends_user\n    }\n    id\n  }\n}\n\nfragment FriendCard_user on User {\n  name\n  profilePicture {\n    url\n  }\n}\n\nfragment Friends_user on User {\n  friends(first: 10) {\n    count\n    edges {\n      node {\n        id\n        ...FriendCard_user\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node/*: any*/).hash = "a6b9278522433a2fc15be2fa73724fdb";

module.exports = ((node/*: any*/)/*: Query<
  FriendsQuery$variables,
  FriendsQuery$data,
>*/);
