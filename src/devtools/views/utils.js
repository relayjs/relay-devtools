// @flow

export function alphaSortEntries(
  entryA: [string, mixed],
  entryB: [string, mixed]
): number {
  const a = entryA[0];
  const b = entryB[0];
  if ('' + +a === a) {
    if ('' + +b !== b) {
      return -1;
    }
    return +a < +b ? -1 : 1;
  }
  return a < b ? -1 : 1;
}

export function serializeDataForCopy(props: Object): string {
  try {
    return JSON.stringify(props, null, 2);
  } catch (error) {
    return '';
  }
}

export function truncateText(text: string, maxLength: number): string {
  const { length } = text;
  if (length > maxLength) {
    return (
      text.substr(0, Math.floor(maxLength / 2)) +
      '…' +
      text.substr(length - Math.ceil(maxLength / 2) - 1)
    );
  } else {
    return text;
  }
}
