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
import { serializeEventLoggerRecording } from './utils';

import styles from './RecordingImportExportButtons.css';

// Keeping this in memory seems to be enough to enable the browser to download larger recordings.
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
  isRecording: boolean,
  store: Store,
  importing: boolean,
  setImporting: boolean => void,
|}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const [err, setErr] = useState('');
  const [environmentIDs, setEnvironmentIDs] = useState([]);
  const [environmentNames, setEnvironmentNames] = useState({});

  const downloadData = useCallback(() => {
    const anchorElement = downloadRef.current;
    const allEventsWithEnvironmentNames = serializeEventLoggerRecording(
      props.store
    );
    if (allEventsWithEnvironmentNames != null && anchorElement != null) {
      const date = new Date();
      const text = JSON.stringify(allEventsWithEnvironmentNames, null, 2);
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
  }, [props.store]);

  const loadData = useCallback(() => {
    if (!props.isRecording && inputRef.current !== null) {
      inputRef.current.click();
    }
  }, [props.isRecording]);

  const environmentChange = useCallback(
    e => {
      props.store.setImportEnvID(parseInt(e.target.value));
    },
    [props.store]
  );

  const handleFiles = useCallback(() => {
    const input = inputRef.current;
    if (input !== null && input.files.length > 0) {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        try {
          const raw = ((fileReader.result: any): string);
          const parsedDataRecording = ((new Map(JSON.parse(raw)): any): Map<
            string,
            Array<LogEvent>
          >);
          const envIDs = [];
          const envNames = {};
          parsedDataRecording.forEach((val, key) => {
            const environment = String(key).split(' ');
            const id = parseInt(environment.shift());
            const name = environment.join(' ');
            envIDs.push(id);
            envNames[id] = name;
            props.store.setAllEventsMap(id, val);
          });
          props.store.setImportEnvID(envIDs[0]);

          setEnvironmentIDs(envIDs);
          setEnvironmentNames(envNames);
          setErr('');
        } catch (error) {
          console.error(
            'Error loading file: ' +
              error +
              '. Please try again with a valid JSON file format.'
          );
          setErr('Error Loading File. Check console for more details.');
        }
        props.setImporting(true);
      });
      fileReader.readAsText(input.files[0]);
    }
  }, [props, setErr, setEnvironmentIDs, setEnvironmentNames]);

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
      <Button onClick={loadData} title="Load recording...">
        <ButtonIcon type="import" />
      </Button>
      <Button
        disabled={props.isRecording}
        onClick={downloadData}
        title="Save recording..."
      >
        <ButtonIcon type="export" />
      </Button>
      {props.importing && (
        <select
          className={styles.environmentDropDown}
          onChange={environmentChange}
        >
          {environmentIDs.map(key => {
            return (
              <option key={key} value={key}>
                {key}: {environmentNames[key]}
              </option>
            );
          })}
        </select>
      )}
      <div className={styles.Errors}>
        <p className={styles.ErrorMsg}>{err}</p>
      </div>
    </Fragment>
  );
}
