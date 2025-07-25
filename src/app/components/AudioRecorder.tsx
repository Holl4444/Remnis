'use client';

import { useRef, useState, useEffect , forwardRef, useImperativeHandle} from 'react';
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

// Send AudioRecorder utilities to MemForm - trigger DeleteTrack in deleteMemory
const AudioRecorder = forwardRef(
  function AudioRecorder({
    onTranscription,
    currentMem,
    onTranscriptionError,
    onAudioStateChange,
  }: {
      onTranscription: (text: string) => void;
      currentMem: string;
    onTranscriptionError: (errorMessage: string) => void;
    onAudioStateChange: (state: string) => void;
  }, ref) {
    // Audiostate handles UI for isRecording / not recording / blobhandling / playing audio
    const [audioState, setAudioState] = useState<
      | 'default'
      | 'recording'
      | 'playing'
      | 'transcribing'
      | 'blob handling'
    >('default');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    // Share the current media recorder across the component
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const transcribeBtnRef = useRef<HTMLButtonElement>(null);

    // Focus the Transcribe button after recording
    useEffect(() => {
      if (audioState === 'playing' && transcribeBtnRef.current) {
        transcribeBtnRef.current.focus();
      }
    }, [audioState]);

    useEffect(() => {
      if (onAudioStateChange) {
        if (audioState === 'recording')
          onAudioStateChange('Recording...');
        else if (audioState === 'playing')
          onAudioStateChange('Recording complete.');
        else if (audioState === 'transcribing')
          onAudioStateChange('Transcribing...');
        else onAudioStateChange('');
      }
    }, [audioState, onAudioStateChange]);

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
          // TODO: Notify user softly
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
    // Get the blob returned by the mediaRecorder and save to state
    // Clean up local stream
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
        setAudioState('playing');
      }
    }

    function handleStopClick() {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      console.log(`Recording stopped`);
    }

    function deleteTrack() {
      console.log('deleting track...');
      setAudioBlob(null);
      onTranscription('');
      setAudioState('default');
    }

    // 
    useImperativeHandle(ref, () => ({
      deleteTrack,
    }))

    function convertAudio() {
      if (audioBlob) {
        const audioFile = new File([audioBlob], 'audio.webm', {
          type: 'audio/webm',
        });
        const fileData = new FormData();
        fileData.append('audioFile', audioFile);
        return fileData;
      }
      console.error(`No audio detected.`);
    }

    // Blob -> File -> Formdata
    async function postAudioFile() {
      try {
        setAudioState('transcribing');
        const audioForm = convertAudio();
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: audioForm,
        });
        if (!audioForm) {
          throw new Error(`Transcription unsuccessful`);
        }

        const result = await response.json();

        if (!result.success) {
          if (onTranscriptionError)
            onTranscriptionError(result.errorMessage);
        } else {
          onTranscription(`${currentMem.trim()}\n\n${result.text}`);
          console.log(result);
          
        }
      } catch (err) {
        console.error(`Request could not be sent: ${err}`);
      }
      setAudioState('default');
    }

    return (
      <>
        <div aria-live="polite" className={styles.sr}>
          {audioState === 'playing'
            ? 'Recording complete. Playback, transcription and delete options available.'
            : audioState === 'recording'
            ? 'Recording in progress.'
            : audioState === 'transcribing'
            ? 'Transcribing audio...'
            : ''}
        </div>

        {audioState !== 'playing' && audioState !== 'transcribing' ? (
          <div className={styles.recordControls}>
            <button
              onClick={handleRecordClick}
              className={`${styles.button} ${styles.recordBtn}`}
              type="button"
              aria-label="Start Recording"
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
              type="button"
              aria-label="Stop Recording"
              disabled={
                audioState !== 'recording'
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
                <button
                  onClick={postAudioFile}
                  className={styles.transcribeBtn}
                  type="button"
                  aria-label="Transcribe audio"
                  ref={transcribeBtnRef}
                >
                  Transcribe
                  <span className={styles.icon}>
                    <FontAwesomeIcon icon={faPencil} />
                  </span>
                </button>
                <button
                  onClick={deleteTrack}
                  className={styles.deleteTrackBtn}
                  type="button"
                  aria-label="Delete recording"
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
)

export default AudioRecorder;