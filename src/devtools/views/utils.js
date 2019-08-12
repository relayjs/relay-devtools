// @flow

// Keeping this in memory seems to be enough to enable the browser to download larger profiles.
// Without this, we would see a "Download failed: network error" failure.
let downloadUrl = null;

export function downloadFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  if (downloadUrl !== null) {
    URL.revokeObjectURL(downloadUrl);
  }

  downloadUrl = URL.createObjectURL(blob);

  const element = document.createElement('a');
  element.setAttribute('href', downloadUrl);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  ((document.body: any): HTMLBodyElement).appendChild(element);

  element.click();

  ((document.body: any): HTMLBodyElement).removeChild(element);
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
