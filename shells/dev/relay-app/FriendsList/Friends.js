// @flow

import React, { Fragment } from 'react';
import { graphql, createPaginationContainer } from 'react-relay';
import FriendCard from './FriendCard';
import styles from './Friends.css';
import type { Friends_user } from './__generated__/Friends_user.graphql';
import type { RelayProps } from 'react-relay';

type Props = {|
  +user: Friends_user,
  +relay: RelayProps,
|};

export default createPaginationContainer(
  function Friends(props: Props) {
    const edges = Array.isArray(props.user.friends?.edges)
      ? props.user.friends?.edges
      : null;
    if (edges == null) {
      return null;
    }

    return (
      <Fragment>
        <ul className={styles.FriendsList}>
          {edges.map(edge => {
            return (
              <li key={edge?.node?.id} className={styles.ListRow}>
                <FriendCard user={edge?.node} />
              </li>
            );
          })}
        </ul>
        <button
          disabled={props.relay.isLoading() || !props.relay.hasMore()}
          onClick={() => {
            props.relay.loadMore();
          }}
        >
          Load more
        </button>
      </Fragment>
    );
  },
  {
    user: graphql`
      fragment Friends_user on User {
        friends(first: 10) @connection(key: "User_friends") {
          count
          edges {
            node {
              id
              ...FriendCard_user
            }
          }
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      return props.user && props.user.friends;
    },
    getFragmentVariables() {
      return {};
    },
    getVariables(props) {
      return props;
    },
    query: graphql`
      query FriendsQuery @relay_test_operation {
        user: node(id: "my-id") {
          ... on User {
            id
            ...Friends_user
          }
        }
      }
    `,
  }
);
