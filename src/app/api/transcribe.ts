import fs from 'fs';
import Openai from 'openai';

const openai = new Openai();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream('path-to-file.audio.mp3'),
  model: 'whisper-1',
});

console.log(transcription.text);

// File uploads are currently limited to 25 MB, and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm
// On output, whisper-1 supports a range of formats (json, text, srt, verbose_json, vtt) (default json)