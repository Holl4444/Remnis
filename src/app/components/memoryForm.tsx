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
  const [currentMemId, setCurrentMemId] = useState('');
  const [messageClass, setMessageClass] = useState('');
  const [textareaState, setTextAreaState] = useState('');

  // Consolidated message state
  const [currentMessage, setCurrentMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'audio' | 'transcription-error';
  } | null>(null);

  const audioRecorderRef = useRef<{ deleteTrack: () => void }>(null);
  const popupRef = useRef<HTMLElement>(null);

  // Helper functions to set different message types
  const setMessage = (
    text: string,
    type: 'success' | 'error' | 'audio' | 'transcription-error'
  ) => {
    console.log('setMessage called with:', { text, type });
    setCurrentMessage((prev) => {
      // Prevent unnecessary updates if message is the same
      if (prev?.text === text && prev?.type === type) {
        console.log('Message unchanged, returning previous:', prev);
        return prev;
      }
      console.log('Setting new message:', { text, type });
      return { text, type };
    });
  };

  const setAudioStatusMsg = (msg: string) => {
    // Ignore empty strings and let messages timeout
    if (msg === 'STOP_RECORDING') {
      setCurrentMessage(null);
    } else if (msg) {
      setMessage(msg, 'audio');
    }
  };

  const handleTransciptionError = (error: unknown) => {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    setMessage(errorMsg, 'transcription-error');
  };

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
    console.log(
      'MemoryForm: about to fetch:',
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/memories`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/memories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory),
      }
    );
    console.log(
      'MemoryForm: fetch response status:',
      response.status
    );
    console.log('MemoryForm: fetch response ok:', response.ok);

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
    console.log(
      'MemoryForm: about to delete fetch:',
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/memories/${memId}`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/memories/${memId}`,
      {
        method: 'DELETE',
        // Added for safety
        headers: { 'Content-Type': 'application/json' },
      }
    );
    console.log(
      'MemoryForm: delete response status:',
      response.status
    );
    console.log('MemoryForm: delete response ok:', response.ok);

    hidePopup();

    if (response.ok) {
      const responseData = await response.json();
      setCurrentMemId(responseData.memId);
      setMessage('Memory Deleted', 'success');
      return {
        success: true,
        message: 'Memory deleted successfully',
      };
    } else {
      setMessage('Failed to delete memory', 'error');
      return { issue: 'Failed to delete memory' };
    }
  };

  function confirmDelete() {
    showPopup();
  }

  function showPopup() {
    popupRef.current?.classList.remove(styles.hidden);
  }

  function hidePopup() {
    // Adding <HTMLButtonElement> above doesn't override generic EventTarget
    popupRef.current?.classList.add(styles.hidden);
  }

  // Update UI & Hide (fade out) the messages
  useEffect(() => {
    if (!currentMessage) return;

    setMessageClass('');

    // Set timeout based on message type
    // Special case: "Recording..." should persist until explicitly cleared
    if (currentMessage.text === 'Recording...') {
      return; // Don't set any timeout for recording message
    }

    const timeoutDuration =
      currentMessage.type === 'transcription-error'
        ? 5000
        : currentMessage.type === 'audio'
        ? 2000
        : 3000;

    // Capture the message type now, before the timeout
    const messageType = currentMessage.type;

    const msgId = setTimeout(() => {
      setMessageClass('hidden');
      if (messageType === 'success') {
        // Clear audio recorder after success message hides
        audioRecorderRef.current?.deleteTrack();
      }
    }, timeoutDuration);

    return () => clearTimeout(msgId);
  }, [currentMessage]);

  // Set success message when form completes
  useEffect(() => {
    console.log('Success useEffect triggered:', { state, isPending });
    if (state && !isPending) {
      setTextAreaState('');
      console.log('About to set Memory Saved message');
      if ('issue' in state) {
        setMessage(state.issue, 'error');
      } else {
        setMessage('Memory Saved', 'success');
        console.log('Just called setMessage with Memory Saved');
      }
    }
  }, [state, isPending]);

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
          {currentMessage && currentMessage.text}
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
            {isPending ? 'Deleting memory' : 'Delete memory'}
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
