/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 *
 * This script installs the global Hook, which will later be used to look up
 * RelayEnvironment instances on the page. It also bootstraps a connection to
 * the Relay Devtools frontend, to communicate when a RelayEnvironment is found.
 *
 * It's important that this script remain lightweight, as it is installed on
 * every page load.
 */

'use strict';

import {installGlobalHook} from '../../../backend/GlobalHook';

// This script is injected into every page.
// import { installHook } from 'src/backend/hook'
// import { isFirefox } from 'src/devtools/env'

// inject the hook
if (document instanceof HTMLDocument) {
  const source = ';(' + installGlobalHook.toString() + ')(window)'

  // if (isFirefox) {
    // eslint-disable-next-line no-eval
  //   window.eval(source) // in Firefox, this evaluates on the content window
  // } else {
    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  // }
}
