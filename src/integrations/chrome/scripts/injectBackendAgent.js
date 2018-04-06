/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

declare var chrome: any;

/**
 * Because Chrome content scripts cannot directly access the JavaScript context,
 * but can access the DOM, the backend Agent is installed by injecting a script
 * tag into the document.
 *
 * Note that this script is always injected *after* globalHook, which means
 * the hook has been installed and the chrome devtools messaging proxy exists.
 */
const script = document.createElement('script');
script.src = chrome.extension.getURL('backendAgent.js');
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
