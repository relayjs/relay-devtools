/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import ChromeDevtoolsAPI from './ChromeDevtoolsAPI';
import DevelMockAPI from './DevelMockAPI';
import ReactNativeBridgeAPI from './ReactNativeBridgeAPI';

import { inDevMode, inChromeDevTools, inElectron } from '../util/util.js';

const API = inChromeDevTools()
  ? ChromeDevtoolsAPI
  : inElectron() ? ReactNativeBridgeAPI : inDevMode() ? DevelMockAPI : null;

export default API;
