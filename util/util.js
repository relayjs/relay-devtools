/* global chrome:false */
export function inDevMode() {
  return (
    typeof chrome === 'undefined' || typeof chrome.devtools === 'undefined'
  );
}

function format(fmt, args) {
  if (!args.length) {
    return fmt;
  }

  return fmt.replace(/(%([%jds]))/g, match => {
    switch (match) {
      case '%s':
        return JSON.stringify(String(args.shift()));
      case '%d':
        return JSON.stringify(Number(args.shift()));
      case '%j':
        return JSON.stringify(args.shift());
      case '%%':
        return '%';
      default:
        throw new Error('No match');
    }
  });
}

// require('util').format-like interface that escapes arguments before eval
export async function inspectedEval(templateString, ...args) {
  return new Promise((resolve, reject) => {
    if (inDevMode()) {
      reject(new Error('Cannot eval while developing devtool.'));
    } else {
      chrome.devtools.inspectedWindow.eval(
        format(templateString, args),
        (res, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        },
      );
    }
  });
}
