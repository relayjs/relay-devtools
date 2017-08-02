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

import { inDevMode } from '../util/util.js';

const API = inDevMode() ? DevelMockAPI : ChromeDevtoolsAPI;
export default API;
