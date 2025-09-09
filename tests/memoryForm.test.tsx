import MemForm from '../src/app/components/memoryForm';
import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let submitBtn: HTMLElement;

// Mock useActionState - return success state to trigger "Memory Saved" message
const mockState: { 'text-area': string } = {
  'text-area': 'test content',
};
const mockFormAction = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, mockFormAction, false]),
  };
});

beforeEach(() => {
  // Reset mock
  mockFormAction.mockClear();

  // Mock fetch to simulate successful API call
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ memId: 'test-123' }),
  });

  render(<MemForm />);
  submitBtn = screen.getByRole('button', { name: /Save memory/i });
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

    await userEvent.type(textArea, 'Can type test.');
    expect(textArea.value).toBe('Can type test.');

    await act(async () => {
      await userEvent.click(submitBtn);
    });

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

  it('should clear the text area when Memory Saved message shows', async () => {
    // Since the mock returns success state, the message should already be showing
    const msgEl = screen.getByTestId('msgEl');

    // Wait for the success message to appear
    await waitFor(() => {
      expect(msgEl.textContent).toContain('Memory Saved');
    });

    // When "Memory Saved" is showing, textarea should be cleared
    const textArea = screen.getByTestId(
      'text-area'
    ) as HTMLTextAreaElement;
    expect(textArea.value).toBe('');
  });

  it('should display an error on transcription error ', async () => {
    // Set up the error triggering button at top and gave it 'Mocked Error!'
    const triggerErrorBtn = screen.getByText('Trigger error');
    const msgEl = screen.getByTestId('msgEl');

    await act(async () => {
      await userEvent.click(triggerErrorBtn);
    });

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

    await act(async () => {
      await userEvent.click(submitBtn);
    });

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
