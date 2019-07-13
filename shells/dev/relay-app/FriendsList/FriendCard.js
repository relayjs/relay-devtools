// @flow

import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styles from './FriendCard.css';
import type { FriendCard_user } from './__generated__/FriendCard_user.graphql';

type Props = {|
  +user: FriendCard_user,
|};

export default createFragmentContainer(
  function FriendCard(props: Props) {
    return (
      <div className={styles.Card}>
        <img
          className={styles.ProfilePic}
          src={props.user.profilePicture?.url}
          alt={props.user.name}
        />
        <span>{props.user.name}</span>
      </div>
    );
  },
  {
    user: graphql`
      fragment FriendCard_user on User {
        name
        profilePicture {
          url
        }
      }
    `,
  }
);
