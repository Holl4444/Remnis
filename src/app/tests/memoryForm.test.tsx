import MemForm from '../components/memoryForm';
import { it, expect, describe } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MemForm testing', () => {
  it('should render the text area and submit button', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText(
      'Share your memory here...'
    );
    const subBtn = screen.getByRole('button');

    expect(subBtn).toBeTruthy();
    expect(textArea).toBeTruthy();
  });

  it('should submit text-area input', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText<HTMLInputElement>(
      'Share your memory here...'
    );
    const subBtn = screen.getByRole('button');

    await userEvent.type(textArea, 'Can type test.');

    expect(textArea.value).toBe('Can type test.');

    await userEvent.click(subBtn);

    expect(screen.getByText('Memory Saved')).toBeTruthy();
  });

  it('should provoke a pop up on invalid form data or an empty text-area', async () => {
    render(<MemForm />);

    const subBtn = screen.getByRole('button');

    await userEvent.click(subBtn);

    expect(
      screen.queryByText('Add a memory to bank :)')
    ).toBeTruthy();
    expect(screen.queryByText('Memory Saved')).toBeFalsy();
  });

  it('should remove messages after 3 seconds', async () => {
    render(<MemForm />);

    const textArea = screen.getByPlaceholderText(
      'Share your memory here...'
    );
    await userEvent.type(textArea, 'A memory added');

    const subBtn = screen.getByRole('button');

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
