// @flow

import LRU from 'lru-cache';

const cachedDisplayNames: WeakMap<Function, string> = new WeakMap();

// On large trees, encoding takes significant time.
// Try to reuse the already encoded strings.
let encodedStringCache = new LRU({ max: 1000 });

export function getDisplayName(
  type: Function,
  fallbackName: string = 'Anonymous'
): string {
  const nameFromCache = cachedDisplayNames.get(type);
  if (nameFromCache != null) {
    return nameFromCache;
  }

  let displayName;

  // The displayName property is not guaranteed to be a string.
  // It's only safe to use for our purposes if it's a string.
  // github.com/facebook/react-devtools/issues/803
  if (typeof type.displayName === 'string') {
    displayName = type.displayName;
  }

  if (!displayName) {
    displayName = type.name || fallbackName;
  }

  cachedDisplayNames.set(type, displayName);
  return displayName;
}

let uidCounter: number = 0;

export function getUID(): number {
  return ++uidCounter;
}

export function utfDecodeString(array: Array<number>): string {
  return String.fromCodePoint(...array);
}

export function utfEncodeString(string: string): Array<number> {
  let cached = encodedStringCache.get(string);
  if (cached !== undefined) {
    return cached;
  }

  const encoded = new Array(string.length);
  for (let i = 0; i < string.length; i++) {
    encoded[i] = string.codePointAt(i);
  }
  encodedStringCache.set(string, encoded);
  return encoded;
}

export function printOperationsArray(operations: Array<number>) {
  // The first two values are always rendererID and rootID
  const rendererID = operations[0];
  const rootID = operations[1];

  const logs = [`opertions for renderer:${rendererID} and root:${rootID}`];
  logs.push('TODO');
  console.log(logs.join('\n  '));
}

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
export function shallowDiffers(prev: Object, next: Object): boolean {
  for (let attribute in prev) {
    if (!(attribute in next)) {
      return true;
    }
  }
  for (let attribute in next) {
    if (prev[attribute] !== next[attribute]) {
      return true;
    }
  }
  return false;
}

export function getInObject(object: Object, path: Array<string | number>): any {
  return path.reduce((reduced: Object, attr: string | number): any => {
    if (typeof reduced === 'object' && reduced !== null) {
      return reduced[attr];
    } else if (Array.isArray(reduced)) {
      return reduced[attr];
    } else {
      return null;
    }
  }, object);
}

export function setInObject(
  object: Object,
  path: Array<string | number>,
  value: any
) {
  const length = path.length;
  const last = path[length - 1];
  if (object != null) {
    const parent = getInObject(object, path.slice(0, length - 1));
    if (parent) {
      parent[last] = value;
    }
  }
}
