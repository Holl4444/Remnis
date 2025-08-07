import { NextRequest, NextResponse } from 'next/server';
import { toFile } from 'openai/uploads';
import Openai from 'openai';
import { v4 as uuidv4 } from 'uuid';

// Audio blob -> file(to select name/type) -> formdata(to send) -> POST -> request -> formdata(to get) -> file(for toFile) -> buffer(for OpenAI)!!

export async function POST(request: NextRequest) {
  try {
  const audioForm = await request.formData();
  const audioFile = audioForm.get('audioFile');
  if (!audioFile || typeof audioFile === 'string') {
    return NextResponse.json({
      success: false,
      error: 400,
      errorMessage: `No audio data provided`,
    });
  }
  const bufferFile = await toFile(audioFile, 'audio.webm');

  const openai = new Openai();
  const transcription = await openai.audio.transcriptions.create({
    file: bufferFile,
    model: 'whisper-1',
    prompt:
      'Personal memory story with common phrases and expressions',
  });
  return NextResponse.json({
    success: true,
    text: transcription.text,
    memId: uuidv4(),
  });
} catch (err) {
      return NextResponse.json({
        success: false,
        error: 500,
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
  }
}

// 06/25: File uploads are currently limited to 25 MB, and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm
// On output, whisper-1 supports a range of formats (json, text, srt, verbose_json, vtt) (default json)
