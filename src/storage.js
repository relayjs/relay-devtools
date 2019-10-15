// @flow

export function localStorageGetItem(key: string): any {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function localStorageSetItem(key: string, value: any): void {
  try {
    return localStorage.setItem(key, value);
  } catch (error) {}
}
