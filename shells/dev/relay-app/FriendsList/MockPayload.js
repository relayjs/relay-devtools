// @flow
import Chance from 'chance';

type User = {|
  id: string,
  name: string,
  profilePicture: {|
    +url: string,
  |},
|};

export default class MockPayload {
  _userId: number;
  _friends: $ReadOnlyArray<{
    cursor: string,
    node: User,
  }>;
  _chance: Chance;
  _node: User;

  constructor() {
    this._chance = new Chance();
    this._friends = [];
    this._node = this._createUser();
  }

  _createUser() {
    const id = this._chance.hash();
    const gender = this._chance.pickone(['male', 'female']);
    return {
      id,
      name: this._chance.name({
        gender,
      }),
      profilePicture: {
        url: `https://randomuser.me/api/portraits/thumb/${
          gender === 'male' ? 'men' : 'women'
        }/${this._friends.length + 1}.jpg`,
      },
    };
  }

  generate() {
    this._friends = this._friends.concat([
      {
        cursor: this._chance.hash(),
        node: this._createUser(),
      },
    ]);
    return {
      Node: () => this._node,
      PageInfo: () => ({
        hasNextPage: true,
      }),
      FriendsConnection: () => ({
        count: this._friends.length + 1,
        edges: this._friends,
      }),
    };
  }
}
