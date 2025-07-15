import AudioRecorder from '../src/app/components/AudioRecorder';
import { it, expect, describe, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

// Need to mock the browser only createObjectURL to simulate return from recording. Adding it to Node.js's global object (like browser window) to access during testing.
if (!global.URL.createObjectURL) {
  // Avoid crashes by always returning a string
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
}

//If the code needs the microphone, give it a fake object that looks like a real one but does nothing. Real process = call getUserMedia -> return array of 'track' Objects which each have the stop method on them. Essentially passing the fake stop method so it can be called - give it what it expects even if it doesn't actually function.
// Add or overwrite mediaDevices on the navigator Object (writable so can change it.)
beforeAll(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });

  // Type faking so we only add parts we need. Keeps it simple.
  class MockMediaRecorder {
    // static isTypeSupported calling it on itself not an instance. If any code checks brute force typesupported as true.
    static isTypeSupported(/* type: string */): boolean {
      return true;
    }
    // Real MediaRecorder fires a dataavailable event after recording ends.
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    //Does nothing but give the code something to call to avoid crashing.
    start = vi.fn();
    //Checks if there's a callback in ondataavailable and calls with fake Blob - again fulfilling code expectations but not functional.
    stop = vi
      // Make a fake function, and when it's called, run this code.
      .fn()
      .mockImplementation(function (this: MockMediaRecorder) {
        // Simulate dataavailable event with fake blob
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['audio']) });
        }
      });

    //Fake vrsn of real eventListener. When code calls mediaRecorder.addEventListener('dataavailable', callback) this is what runs:
    addEventListener = (
      event: string,
      cb: (e: { data: Blob }) => void
    ) => {
        // Set up so the fake stop function gets a Blob.
      if (event === 'dataavailable') this.ondataavailable = cb;
    };
    removeEventListener = vi.fn();
    }
    //Tell Node.js (Next test env) to fake having a mediaRecorder and give it the mock.
  // @ts-expect-error: partial mock for testing, not all MediaRecorder props are implemented
  global.MediaRecorder = MockMediaRecorder;
});

describe('AudioRecorder component tests', () => {
  it('should switch to the audioplayer tsx when recording is completed', async () => {
    render(
      <AudioRecorder
        onTranscription={() => {}}
        onTranscriptionError={() => {}}
      />
    );
    // press record -> press stop
    //check the transcribe button exists and is focused

    const recordBtn = screen.getByRole('button', {
      name: 'Start Recording',
    });
    const stopBtn = screen.getByRole('button', {
      name: 'Stop Recording',
    });

    await userEvent.click(recordBtn);
    await userEvent.click(stopBtn);

    const transcribeBtn = screen.getByRole('button', {
      name: 'Transcribe audio',
    });

    await waitFor(() => {
      expect(transcribeBtn).toBeDefined();
      expect(transcribeBtn).toBeEnabled();
      expect(document.activeElement).toBe(transcribeBtn);
    });
  });
});
