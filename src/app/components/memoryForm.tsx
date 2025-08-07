// Consider changing Audiostatusmsg to general messages.
// Update delete to handle memories not yet stored on server.

'use client';
import { useActionState, useState, useEffect, useRef } from 'react';
import AudioRecorder from './AudioRecorder';
import ResizableTextarea from './Textarea';

import styles from './memoryForm.module.css';

export interface Memory {
  title?: string;
  year?: string;
  tagged?: string;
  'text-area'?: string;
}

export default function MemForm() {
  const [currentMemId, setCurrentMemId] = useState(
    ''
  );
  const [messageClass, setMessageClass] = useState('');
  const [textareaState, setTextAreaState] = useState('');
  const [transcriptionError, setTranscriptionError] = useState('');
  // Audiostate handles UI for isRecording / not recording / blobhandling / playing audio
  const [audioStatusMsg, setAudioStatusMsg] = useState<string>('');

  const audioRecorderRef = useRef<{ deleteTrack: () => void }>(null);
  const popupRef = useRef<HTMLElement>(null);

  const updateDB = async (
    _prevMem: Memory | { issue: string } | null,
    formData: FormData
  ) => {
    const memory: Memory | { issue: string } | null =
      Object.fromEntries(formData.entries());

    if (!memory || memory['text-area']?.trim() === '') {
      return { issue: `Add a memory to bank :)` };
    }
    console.log(memory);

    // Make fetch request to API
    const response = await fetch('api/postToDb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory),
    });

    if (response.ok) {
      const responseData = await response.json();
      setCurrentMemId(responseData.memId);
      return memory;
    } else {
      return { issue: 'Failed to save memory' };
    }
  };

  // Doesn't work like useState so we can move it below updateDB
  const [state, formAction, isPending] = useActionState(
    updateDB,
    null
  );

  const deleteMemory = async (memId: string) => {
    // Clear audioRecorder
    audioRecorderRef.current?.deleteTrack();
    // Make delete request to API
    const response = await fetch(`api/deleteMemory/${memId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const responseData = await response.json();
      setCurrentMemId(responseData.memId);
    }

    hidePopup();

    if (response.ok) {
      setAudioStatusMsg('Memory Deleted');
      return {
        success: true,
        message: 'Memory deleted successfully',
      };
    } else {
      return { issue: 'Failed to delete memory' };
    }
  };

  function confirmDelete() {
    // Add memory deletion confirmation.
    showPopup();
  }

  function showPopup() {
    popupRef.current?.classList.remove(styles.hidden);
  }

  function hidePopup() {
    // Adding <HTMLButtonElement> above doesn't override generic EventTarget
    popupRef.current?.classList.add(styles.hidden);
  }

  function handleTransciptionError(error: unknown) {
    setTranscriptionError(
      error instanceof Error ? error.message : String(error)
    );
  }

  // Update UI & Hide (fade out) the messages. Clear any previous msg
  useEffect(() => {
    //Track which message needs cancelling if another is called
    let msgId: ReturnType<typeof setTimeout>;

    if (state && !isPending) {
      setTextAreaState('');
      setMessageClass('');
      msgId = setTimeout(() => setMessageClass('hidden'), 3000);
    } else if (transcriptionError) {
      setMessageClass('');
      msgId = setTimeout(() => setMessageClass('hidden'), 5000);
    } else if (audioStatusMsg) {
      setMessageClass('');
      msgId = setTimeout(() => setMessageClass('hidden'), 2000);
    } else {
      setMessageClass('');
      msgId = setTimeout(() => setMessageClass('hidden'), 3000);
    }
    return () => clearTimeout(msgId);
  }, [state, isPending, transcriptionError, audioStatusMsg]);

  return (
    <form action={formAction} className={styles.memForm}>
      <section className={styles.memFormInputs}>
        <div className={styles.memFormInput}>
          <label htmlFor="title" className={styles.label}>
            Subject:{' '}
          </label>
          <input
            className={styles.input}
            type="text"
            id="title"
            name="title"
            maxLength={30}
            placeholder="Fi's first easter..."
            // Need at least one tag to conform to dynamodb string sets also, be wary deleting
            required
          />
        </div>
        <div className={styles.memFormInput}>
          <label htmlFor="year" className={styles.label}>
            When:{' '}
          </label>
          <input
            className={styles.input}
            type="text"
            id="year"
            name="year"
            minLength={2}
            maxLength={20}
            title="Any hint at when you're talking about! Decade, year, month, 'When I was about 10'"
            placeholder="1975.."
          />
        </div>
        <div className={styles.memFormInput}>
          <label htmlFor="tagged" className={styles.label}>
            Who:{' '}
          </label>
          <input
            className={styles.input}
            type="text"
            id="tagged"
            name="tagged"
            placeholder="Kath, Gran Ren..."
            maxLength={30}
          />
        </div>
      </section>

      <AudioRecorder
        ref={audioRecorderRef}
        onTranscription={setTextAreaState}
        currentMem={textareaState}
        onTranscriptionError={handleTransciptionError}
        onAudioStateChange={setAudioStatusMsg}
      />

      <div className={styles.submitWrap}>
        <p
          className={`${styles.submitMsg} ${styles[messageClass]}`}
          data-testid="msgEl"
        >
          {state &&
            !isPending &&
            ('issue' in state ? state.issue : 'Memory Saved')}
          {transcriptionError && transcriptionError}
          {audioStatusMsg && audioStatusMsg}
        </p>
        <ResizableTextarea
          value={textareaState}
          onChange={(e) => setTextAreaState(e.target.value)}
          id="text-area"
          name="text-area"
          placeholder="Share your memory or click to edit here..."
        />
        <div className={styles.formBtnWrap}>
          <button
            type="submit"
            className={`${styles.memFormBtn} ${styles.button}`}
            disabled={isPending || textareaState === ''}
          >
            {isPending ? 'Saving memory' : 'Save memory'}
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className={`${styles.memFormBtn} ${styles.button}`}
            disabled={isPending || textareaState === ''}
          >
            {isPending ? 'Deleting memory' : 'Delete Memory'}
          </button>
        </div>
      </div>
      <section
        ref={popupRef}
        className={`${styles.popup} ${styles.hidden}`}
      >
        <h1 className={styles.popupTitle}>Are you sure?</h1>
        <p>This memory will be permanantly deleted</p>
        <button
          type="button"
          onClick={() => deleteMemory(currentMemId)}
        >
          Confirm
        </button>
        <button type="button" onClick={hidePopup}>
          Go Back
        </button>
      </section>
    </form>
  );
}
