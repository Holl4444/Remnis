'use client';
import { useActionState, useState, useEffect } from 'react';
// import { useScrollHeight } from '../hooks/useScrollHeight';
import AudioRecorder from './AudioRecorder';
import ResizableTextarea from './Textarea';
import styles from './memoryForm.module.css';

interface Memory {
  title?: string;
  year?: string;
  who?: string;
  'text-area'?: string;
}

const updateDB = (
  _prevMem: Memory | { issue: string } | null,
  formData: FormData
) => {
  const memory: Memory | { issue: string } | null =
    Object.fromEntries(formData.entries());

  if (!memory || memory['text-area']?.trim() === '') {
    return { issue: `Add a memory to bank :)` };
  }
  console.log(memory);
  return memory;
};

export default function MemForm() {
  const [state, formAction, isPending] = useActionState(
    updateDB,
    null
  );
  const [messageClass, setMessageClass] = useState('');
  const [textareaState, setTextAreaState] = useState('');
  const [transcriptionError, setTranscriptionError] = useState('');
  // Audiostate handles UI for isRecording / not recording / blobhandling / playing audio
  const [audioStatusMsg, setAudioStatusMsg] = useState<string>('');

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
        onTranscription={setTextAreaState}
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
        <button
          type="submit"
          className={`${styles.memFormBtn} ${styles.button}`}
          disabled={isPending || textareaState === ''}
        >
          {isPending ? 'Saving memory' : 'Save memory'}
        </button>
      </div>
    </form>
  );
}
