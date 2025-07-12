'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophoneLines,
  faMicrophoneLinesSlash,
  faPencil,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AudioRecorder.module.css';

declare global {
  interface Window {
    localStream?: MediaStream;
    localAudio?: HTMLAudioElement;
  }
}

export default function AudioRecorder() {
  // Add state to handle isRecording / not recording / blobhandling
  const [audioState, setAudioState] = useState('default');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  // Share the current media recorder across the component
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  function recordStream(stream: MediaStream) {
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      getRecording
    );
    mediaRecorderRef.current.start();
    setAudioState('recording');
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

  // Fired by event listener
  function getRecording(e: BlobEvent) {
    try {
      setAudioState('blob handling');
      const memoryAudio = e.data;
      setAudioBlob(memoryAudio);
      console.log(memoryAudio);
    } catch (err) {
      console.log(
        `There is an issue collecting the recording ${err}`
      );
    } finally {
      if (window.localStream) {
        window.localStream
          .getTracks()
          .forEach((track) => track.stop());
        window.localStream = undefined;
      }
      mediaRecorderRef.current = null;
      setAudioState('player');
    }
  }

  function handleStopClick() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setAudioState('default');
    }
    console.log(`Recording stopped`);
  }

  function deleteTrack() {
    console.log('deleting track...');
    setAudioBlob(null);
    setAudioState('default');
  }

  return (
    <>
      {audioState !== 'player' ? (
        <div className={styles.recordControls}>
          <button
            onClick={handleRecordClick}
            className={`${styles.button} ${styles.recordBtn}`}
            disabled={
              audioState === 'recording' ||
              audioState === 'blob handling'
            }
          >
            Record
            <span className={styles.icon}>
              <FontAwesomeIcon icon={faMicrophoneLines} />
            </span>
          </button>
          <button
            onClick={handleStopClick}
            className={`${styles.button} ${styles.stopBtn} `}
            disabled={
              audioState === 'default' ||
              audioState === 'blob handling'
            }
          >
            Stop
            <span className={styles.icon}>
              <FontAwesomeIcon icon={faMicrophoneLinesSlash} />
            </span>
          </button>
        </div>
      ) : (
        audioBlob && (
          <div className={styles.audioPlayerWrap}>
            <div className={styles.audioBtnWrap}>
              <button className={styles.transcribeBtn}>
                Transcribe
                <span className={styles.icon}>
                  <FontAwesomeIcon icon={faPencil} />
                </span>
              </button>
              <button
                onClick={deleteTrack}
                className={styles.deleteTrackBtn}
              >
                Delete
              </button>
            </div>
            <audio
              className={styles.audioPlayer}
              controls
              src={URL.createObjectURL(audioBlob)}
            />
          </div>
        )
      )}
    </>
  );
}
