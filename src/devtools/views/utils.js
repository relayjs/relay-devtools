// @flow

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
