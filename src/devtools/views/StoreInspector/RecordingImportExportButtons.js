/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import { Fragment, useCallback, useRef, useState } from 'react';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import type { LogEvent } from '../../../types';
import type Store from '../../store';

import styles from './RecordingImportExportButtons.css';

// Keeping this in memory seems to be enough to enable the browser to download larger profiles.
// Without this, we would see a "Download failed: network error" failure.
let downloadUrl = null;

function downloadFile(
  element: HTMLAnchorElement,
  filename: string,
  text: string
): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  if (downloadUrl !== null) {
    URL.revokeObjectURL(downloadUrl);
  }

  downloadUrl = URL.createObjectURL(blob);

  element.setAttribute('href', downloadUrl);
  element.setAttribute('download', filename);

  element.click();
}

export default function RecordingImportExportButtons(props: {|
  isProfiling: boolean,
  store: Store,
|}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const [err, setErr] = useState('');

  const allEvents = Array.from(props.store.getAllEventsMap().entries());
  const downloadData = useCallback(() => {
    const anchorElement = downloadRef.current;

    if (allEvents != null && anchorElement != null) {
      const date = new Date();
      const text = JSON.stringify(allEvents, null, 2);
      if (text != null) {
        const dateString = date
          .toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\//g, '-');
        const timeString = date
          .toLocaleTimeString(undefined, {
            hour12: false,
          })
          .replace(/:/g, '-');
        downloadFile(
          anchorElement,
          `relay-devtools-recorded-data.${dateString}.${timeString}.json`,
          text
        );
      }
    }
  }, [allEvents]);

  const loadData = useCallback(() => {
    if (inputRef.current !== null) {
      inputRef.current.click();
    }
  }, []);

  const handleFiles = useCallback(() => {
    const input = inputRef.current;
    if (input !== null && input.files.length > 0) {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        try {
          const raw = ((fileReader.result: any): string);
          const parsedDataRecording = ((new Map(JSON.parse(raw)): any): Map<
            number,
            Array<LogEvent>
          >);
          parsedDataRecording.forEach((val, key) => {
            console.log(key);
            console.log(val);
            props.store.setAllEventsMap(key, val);
          });
          setErr('');
        } catch (error) {
          console.error(
            'Error loading file: ' +
              error +
              '. Please try again with a valid JSON file format.'
          );
          setErr('Error Loading File. Check console for more details.');
        }
      });
      fileReader.readAsText(input.files[0]);
    }
  }, [props.store, setErr]);

  return (
    <Fragment>
      <div className={styles.VRule} />
      <input
        ref={inputRef}
        className={styles.Input}
        type="file"
        onChange={handleFiles}
        tabIndex={-1}
      />
      <a href="/#" ref={downloadRef} className={styles.Input} />
      <Button
        disabled={props.isProfiling}
        onClick={loadData}
        title="Load recording..."
      >
        <ButtonIcon type="import" />
      </Button>
      <Button
        disabled={props.isProfiling}
        onClick={downloadData}
        title="Save recording..."
      >
        <ButtonIcon type="export" />
      </Button>
      <div className={styles.Errors}>
        <p className={styles.ErrorMsg}>{err}</p>
      </div>
    </Fragment>
  );
}
