/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import styles from './StoreInspector.css'

export default function StoreInspector(props: {| +portalContainer: mixed |}) {
  return (
    <div className={styles.UnderConstruction}>
      <div>
        The Store Inspector is currently <span>under construction</span>. More to come soon!
      </div>
      <div>
        Apologies for the inconvenience.
      </div>
    </div>
  );
}
