import MemForm from '../src/app/components/memoryForm';
import { it, expect, describe, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock AudioRecorder to render a button
vi.mock('../src/app/components/AudioRecorder.tsx', () =>({
  default: ({ onTranscriptionError }: { onTranscriptionError: (error: unknown) => void }) => (
    <button onClick={() => onTranscriptionError('Mocked error!')}>Trigger error</button>
  )
}))

describe('MemForm testing', () => {
  it('should render the text area and submit button', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    );
    const subBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    expect(subBtn).toBeTruthy();
    expect(textArea).toBeTruthy();
  });


  it('should submit text-area input', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    ) as HTMLTextAreaElement;
    const subBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    await userEvent.type(textArea, 'Can type test.');

    expect(textArea.value).toBe('Can type test.');

    await userEvent.click(subBtn);

    expect(screen.getByText('Memory Saved')).toBeTruthy();
  });


  it('should disable the submit button when text-area is empty', async () => {
    render(<MemForm />);

    const subBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    expect(subBtn).toBeDisabled();
    expect(screen.queryByText('Add a memory to bank :)')).toBeFalsy();
  });


  it('should clear the text area on form submission', async () => {
    render(<MemForm />);

    const textArea = screen.getByTestId(
      'text-area'
    ) as HTMLTextAreaElement;
    await userEvent.type(textArea, 'Test string');
    expect(textArea.value.trim().length).toBeGreaterThan(0);

    const subBtn = screen.getByRole('button', { name: /Save memory/i });

    await userEvent.click(subBtn);

    const msgEl = screen.getByTestId('msgEl');
    expect(msgEl.textContent).toContain('Memory Saved');

    // Without the timeout will keep checking (to config or default (5s) spec)
    await waitFor(
      () => {  
        expect(textArea.value).toBe(''); 
      }
    );    
  })


  it('should display an error on transcription error ', async () => {
    render(<MemForm />);
    // Set up the error triggering button at top and gave it 'Mocked Error!'
    const triggerErrorBtn = screen.getByText('Trigger error');
    const msgEl = screen.getByTestId('msgEl');

    await userEvent.click(triggerErrorBtn);
    
    expect(msgEl.textContent?.trim().length).toBeGreaterThan(0);
    expect(msgEl.textContent).toContain('Mocked error!');

  });


  it('should remove messages after 3 seconds', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText(
      'Share your memory or click to edit here...'
    );
    await userEvent.type(textArea, 'A memory added');

    const subBtn = screen.getByRole('button', {
      name: /Save memory/i,
    });

    await userEvent.click(subBtn);

    expect(screen.queryByText('Memory Saved')).toBeTruthy();

    await waitFor(
      () => {
        const msgEl = screen.getByText('Memory Saved');
        expect(msgEl.className.includes('hidden')).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});
