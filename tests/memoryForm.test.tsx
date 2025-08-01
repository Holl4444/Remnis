import MemForm from '../src/app/components/memoryForm';
import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let submitBtn;

beforeEach(() => {
  render(<MemForm />);
  submitBtn = screen.getByRole('button', { name: /Save Memory/i });
});

// Mock AudioRecorder to render a button
vi.mock('../src/app/components/AudioRecorder.tsx', () => ({
  default: ({
    onTranscriptionError,
  }: {
    onTranscriptionError: (error: unknown) => void;
  }) => (
    <button onClick={() => onTranscriptionError('Mocked error!')}>
      Trigger error
    </button>
  ),
}));

describe('MemForm testing', () => {
  it('should render the text area and submit button', async () => {
    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    );
    submitBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    expect(submitBtn).toBeTruthy();
    expect(textArea).toBeTruthy();
  });

  it('should submit text-area input', async () => {
    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    ) as HTMLTextAreaElement;
    submitBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    await userEvent.type(textArea, 'Can type test.');

    expect(textArea.value).toBe('Can type test.');

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Memory Saved')).toBeTruthy();
    });
  });

  it('should disable the submit button when text-area is empty', async () => {
    submitBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    expect(submitBtn).toBeDisabled();
    expect(screen.queryByText('Add a memory to bank :)')).toBeFalsy();
  });

  it('should clear the text area on form submission', async () => {
    const textArea = screen.getByTestId(
      'text-area'
    ) as HTMLTextAreaElement;
    await userEvent.type(textArea, 'Test string');
    expect(textArea.value.trim().length).toBeGreaterThan(0);

    submitBtn = screen.getByRole('button', { name: /Save memory/i });

    await userEvent.click(submitBtn);

    const msgEl = screen.getByTestId('msgEl');
    await waitFor(() => {
       expect(msgEl.textContent).toContain('Memory Saved');
    })

    // Without the timeout will keep checking (to config or default (5s) spec)
    await waitFor(
      () => {
        expect(textArea.value).toBe('');
      },
      { timeout: 5000 }
    );
  });

  it('should display an error on transcription error ', async () => {
    // Set up the error triggering button at top and gave it 'Mocked Error!'
    const triggerErrorBtn = screen.getByText('Trigger error');
    const msgEl = screen.getByTestId('msgEl');

    await userEvent.click(triggerErrorBtn);

    expect(msgEl.textContent?.trim().length).toBeGreaterThan(0);
    expect(msgEl.textContent).toContain('Mocked error!');
  });

  it('should remove messages after 3 seconds', async () => {
    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    );
    await userEvent.type(textArea, 'A memory added');

    submitBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    await userEvent.click(submitBtn);

    // TypeScript happier with  this than | undefined | null due to type narrowing in async context
    let msgEl: HTMLElement;
    await waitFor(() => {
      msgEl = screen.getByText('Memory Saved');
      expect(msgEl).toBeTruthy();
    });

    
      await waitFor(
        () => {
          expect(msgEl.className.includes('hidden')).toBe(true);
        },
        { timeout: 5000 }
      );
  });
});
