/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FriendCard_user$ref: FragmentReference;
declare export opaque type FriendCard_user$fragmentType: FriendCard_user$ref;
export type FriendCard_user = {|
  +name: ?string,
  +profilePicture: ?{|
    +url: ?string
  |},
  +$refType: FriendCard_user$ref,
|};
export type FriendCard_user$data = FriendCard_user;
export type FriendCard_user$key = {
  +$data?: FriendCard_user$data,
  +$fragmentRefs: FriendCard_user$ref,
};
*/

const node /*: ReaderFragment*/ = {
  kind: 'Fragment',
  name: 'FriendCard_user',
  type: 'User',
  metadata: null,
  argumentDefinitions: [],
  selections: [
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
  ],
};
// prettier-ignore
(node/*: any*/).hash = 'aa6a813be40074e272758f996347f889';
module.exports = node;
