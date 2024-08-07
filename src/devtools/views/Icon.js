/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import styles from './Icon.css';

export type IconType =
  | 'arrow'
  | 'components'
  | 'fb-feedback'
  | 'flame-chart'
  | 'github-feedback'
  | 'interactions'
  | 'network'
  | 'ranked-chart'
  | 'search'
  | 'settings'
  | 'store-inspector';

type Props = {|
  className?: string,
  type: IconType,
|};

function getPathData(type: IconType) {
  switch (type) {
    case 'arrow':
      return PATH_ARROW;
    case 'components':
      return PATH_COMPONENTS;
    case 'fb-feedback':
      return PATH_FB_FEEDBACK;
    case 'flame-chart':
      return PATH_FLAME_CHART;
    case 'github-feedback':
      return PATH_GITHUB_FEEDBACK;
    case 'interactions':
      return PATH_INTERACTIONS;
    case 'network':
      // TODO add network icon
      return PATH_RANKED_CHART;
    case 'ranked-chart':
      return PATH_RANKED_CHART;
    case 'search':
      return PATH_SEARCH;
    case 'store-inspector':
      return PATH_STORE;
    case 'settings':
      return PATH_SETTINGS;
    default:
      console.warn(`Unsupported type "${(type: empty)}" specified for Icon`);
      return null;
  }
}

export default function Icon({
  className = '',
  type,
}: Props): React$MixedElement {
  const pathData = getPathData(type);
  const circlePathData =
    pathData === PATH_GITHUB_FEEDBACK ? PATH_GITHUB_CIRCLE : null;
  if (pathData === PATH_GITHUB_FEEDBACK) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${styles.Icon} ${className}`}
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path fill="none" stroke="currentColor" d={circlePathData} />
        <path fill="currentColor" d={pathData} />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.Icon} ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="currentColor" d={pathData} />
    </svg>
  );
}

const PATH_ARROW = 'M8 5v14l11-7z';

const PATH_COMPONENTS =
  'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z';

const PATH_FB_FEEDBACK = `
  M 4.5 22.6 L 4.89 19.73 C 4 19.73 3.51 19.73 3.41 19.73 C 2.63 19.73 1.99 18.87 1.99 17.82 C 1.99 16.49 1.99 5.84 1.99 4.51 C 1.99 3.46 2.63 2.6 3.41 2.6 C 5.12 2.6 18.86 2.6 20.58 2.6 C 21.36 2.6 21.99 3.46 21.99 4.51 C 21.99 5.84 21.99 16.49 21.99 17.82 C 21.99 18.87 21.36 19.73 20.58 19.73 C 19.8 19.73 15.9 19.73 8.89 19.73 L 4.5 22.6 Z
`;

const PATH_FLAME_CHART = `
  M10.0650893,21.5040462 C7.14020814,20.6850349 5,18.0558698 5,14.9390244 C5,14.017627
  5,9.81707317 7.83333333,7.37804878 C7.83333333,7.37804878 7.58333333,11.199187 10,
  10.6300813 C11.125,10.326087 13.0062497,7.63043487 8.91666667,2.5 C14.1666667,3.06910569
  19,9.32926829 19,14.9390244 C19,18.0558698 16.8597919,20.6850349 13.9349107,21.5040462
  C14.454014,21.0118505 14.7765152,20.3233394 14.7765152,19.5613412 C14.7765152,17.2826087
  12,15.0875871 12,15.0875871 C12,15.0875871 9.22348485,17.2826087 9.22348485,19.5613412
  C9.22348485,20.3233394 9.54598603,21.0118505 10.0650893,21.5040462 Z M12.0833333,20.6514763
  C11.3814715,20.6514763 10.8125,20.1226027 10.8125,19.4702042 C10.8125,18.6069669
  12.0833333,16.9347829 12.0833333,16.9347829 C12.0833333,16.9347829 13.3541667,18.6069669
  13.3541667,19.4702042 C13.3541667,20.1226027 12.7851952,20.6514763 12.0833333,20.6514763 Z
`;

const PATH_GITHUB_CIRCLE = `M 22.07 13.07 C 22.07 18.59 17.58 23.07 12.07 23.07 C 6.55 23.07 2.07 18.59 2.07 13.07 C 2.07 7.55 6.55 3.07 12.07 3.07 C 17.58 3.07 22.07 7.55 22.07 13.07 Z`;

const PATH_GITHUB_FEEDBACK = `
  M 10.93 5.09 L 12.68 5.09 L 12.68 14.42 L 10.93 14.42 L 10.93 5.09 Z
  M 13.81 18.36 C 13.81 19.46 12.91 20.36 11.81 20.36 C 10.71 20.36 9.81 19.46 9.81 18.36 C 9.81 17.26 10.71 16.36 11.81 16.36 C 12.91 16.36 13.81 17.26 13.81 18.36 Z
`;

const PATH_INTERACTIONS = `
  M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2
  2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55
  4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02
  9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55
  2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z
`;

const PATH_SEARCH = `
  M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91
  16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99
  5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z
`;

const PATH_STORE = `
M12.008 0c-4.225 0-10.008 1.001-10.008 4.361v15.277c0 3.362 6.209 4.362 10.008 4.362 3.783 0 9.992-1.001 9.992-4.361v-15.278c0-3.361-5.965-4.361-9.992-4.361zm0 2c3.638 0 7.992.909 7.992 2.361 0 1.581-5.104 2.361-7.992 2.361-3.412.001-8.008-.905-8.008-2.361 0-1.584 4.812-2.361 8.008-2.361zm7.992 17.386c0 1.751-5.104 2.614-7.992 2.614-3.412 0-8.008-1.002-8.008-2.614v-2.04c2.117 1.342 5.17 1.78 8.008 1.78 2.829 0 5.876-.438 7.992-1.78v2.04zm0-4.873c0 1.75-5.104 2.614-7.992 2.614-3.412-.001-8.008-1.002-8.008-2.614v-2.364c2.116 1.341 5.17 1.78 8.008 1.78 2.839 0 5.881-.442 7.992-1.78v2.364zm-7.992-2.585c-3.426 0-8.008-1.006-8.008-2.614v-2.371c2.117 1.342 5.17 1.78 8.008 1.78 2.829 0 5.876-.438 7.992-1.78v2.372c0 1.753-5.131 2.613-7.992 2.613z`;

const PATH_RANKED_CHART = 'M3 5h18v3H3zM3 10.5h13v3H3zM3 16h8v3H3z';

const PATH_SETTINGS = `
  M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12
  2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39
  0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69
  1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58
  1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0
  .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z
`;
