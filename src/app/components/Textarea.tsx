import { useRef } from 'react';
import styles from './Textarea.module.css';

export default function ResizableTextarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
    if (props.onInput) props.onInput(e);
  }

  return (
    <textarea
      ref={textareaRef}
      onInput={handleInput}
          className={styles.textarea}
      {...props}
      data-testid="text-area"
    />
  );
}
