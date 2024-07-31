/**
 * @generated SignedSource<<c190e08fe0062b0302f8d20582528753>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FriendCard_user$fragmentType: FragmentType;
export type FriendCard_user$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +url: ?string,
  |},
  +$fragmentType: FriendCard_user$fragmentType,
|};
export type FriendCard_user$key = {
  +$data?: FriendCard_user$data,
  +$fragmentSpreads: FriendCard_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FriendCard_user",
  "selections": [
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node/*: any*/).hash = "aa6a813be40074e272758f996347f889";

module.exports = ((node/*: any*/)/*: Fragment<
  FriendCard_user$fragmentType,
  FriendCard_user$data,
>*/);
