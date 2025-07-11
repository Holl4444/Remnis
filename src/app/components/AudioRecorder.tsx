'use client';

import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophoneLines,
  faMicrophoneLinesSlash,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AudioRecorder.module.css';

declare global {
  interface Window {
    localStream?: MediaStream;
    localAudio?: HTMLAudioElement;
  }
}

export default function AudioRecorder() {
  // Share the current media recorder across the component
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  function recordStream(stream: MediaStream) {
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      getRecording
    );
    mediaRecorderRef.current.start();
    console.log(`Recording`);
  }

  async function handleRecordClick() {
    try {
      if (!navigator.mediaDevices) {
        throw new Error(`Unsupported browser - needs getUserMedia`);
        // Notify user softly
      }
      // MediaStream object
      const memoryStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      //Attach MediaStream Object to window as localStream
      window.localStream = memoryStream;
      if (window.localAudio) {
        // Set the <audio> element with id of localAudio's src to be the promise we will return.
        window.localAudio.srcObject = memoryStream;
      }

      recordStream(memoryStream);
    } catch (err) {
      console.error(`Unable to record: ${err}`);
    }
  }

  function getRecording(e: BlobEvent) {
    console.log(`Get recording fired`);
    const memoryAudio = e.data;
    console.log(memoryAudio);
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = undefined;
    }
    mediaRecorderRef.current = null;
  }

  function handleStopClick() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    console.log(`Recording stopped`);
  }

  return (
    <div className={styles.recordControls}>
      <button
        onClick={handleRecordClick}
        className={`${styles.button} ${styles.recordBtn}`}
      >
        Record
        <span className={styles.icon}>
          <FontAwesomeIcon icon={faMicrophoneLines} />
        </span>
      </button>
      <button
        onClick={handleStopClick}
        className={`${styles.button} ${styles.stopBtn} `}
      >
        Stop
        <span className={styles.icon}>
          <FontAwesomeIcon icon={faMicrophoneLinesSlash} />
        </span>
      </button>
    </div>
  );
}
