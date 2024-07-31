/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { LogEvent } from './Logger';

import { registerEventLogger } from './Logger';

let loggingIFrame = null;
let missedEvents = [];

export default function registerDevToolsEventLogger(
  surface: string,
  version: string
) {
  if (__ENABLE_LOGGER__) {
    function logEvent(event: LogEvent) {
      if (loggingIFrame != null) {
        loggingIFrame.contentWindow.postMessage(
          {
            source: 'relay-devtools-logging',
            event: {
              surface,
              version,
              ...event,
            },
          },
          '*'
        );
      } else {
        missedEvents.push(event);
      }
    }

    function handleLoggingIFrameLoaded(iframe: HTMLIFrameElement) {
      if (loggingIFrame != null) {
        return;
      }
      loggingIFrame = iframe;
      if (missedEvents.length > 0) {
        missedEvents.forEach(logEvent);
        missedEvents = [];
      }
    }

    // If logger is enabled, register a logger that captures logged events
    // and render iframe where the logged events will be reported to
    const loggingUrl = process.env.LOGGING_URL;
    const body = document.body;
    if (
      typeof loggingUrl === 'string' &&
      loggingUrl.length > 0 &&
      body != null
    ) {
      registerEventLogger(logEvent);

      const iframe = document.createElement('iframe');
      iframe.src = loggingUrl;
      iframe.onload = function(...args) {
        handleLoggingIFrameLoaded(iframe);
      };
      body.appendChild(iframe);
    }
  }
}
