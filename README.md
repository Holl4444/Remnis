
# $${\color{salmon}Remnis}$$

<img width="300" height="300" alt="image" src="https://github.com/user-attachments/assets/b5963f3c-75eb-4e30-a731-42fd5951502c" /><br/>


[Overview](#overview)\
[Built With](#built-with)\
[Requirements](#requirements)\
[Key Skills](#key-skills)\
[Image Credits](#image-credits)\
[The Process](#the-process)\
[Continued Development](#continued-development)\
[Screenshots](#screenshots)

## Overview

An accessible app to enable storing and sharing memories between authorised users. Memories searchable via user, tagged members, subject and keywords and linked to images connected to events. A photoalbum to help retrieve memories or to give inspiration for those struggling to contribute. 
Users will ultimately be able to add their perspectives or relevant experiences by linking memories together. Text area auto expands as text grows.

### Built With
Next - React 19 - Typescript - Vitest

### Requirements

To install dependencies:
```
npm install
```

To start the development server:
```
npm run dev
```
For development you will also need to create an .env.local folder in the root of the project. You will also need an OpenAI API key, which you can get by creating an account at https://platform.openai.com/docs/api-reference/introduction. You should then add the key to the .env.local file as OPENAI_API_KEY=sk-....

### Key Skills
- Mobile first, responsive css
- UX / clean UI
- Integrated Form: text-area also automatically grows if needed while typing
- Audio Recording
- Safe audiofile transcription
- PWA
- Unit testing

### Image Credits
Photo by [Łukasz Łada@Unsplash](https://unsplash.com/@lukaszlada?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)

https://unsplash.com/photos/sea-of-clouds-LtWFFVi1RXQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash
      

#### The Process
I had originally planned to put this project together with Node.js but transferred it over to Next.js when, having a better idea of the code it seemed the best fit for the project.  It was easier to create a new project than update but the drawback is that the commits for the very early stages are in the old repo, so if you're interested you can see the project taking shape here: https://github.com/Holl4444/RemnisReact. The move did simplify the routes, allowing me to try out features like NextRequest and NextResponse and I was really pleased with how smooth they were to use. 

I started from the form element, thinking of the most basic MVP as more of an online journal and had some fun looking into the changes to forms in React-19. UseActionState was a brilliant update - it enables you to use state anywhere in the component tree and thanks to the optional isPending flag avoids creating isLoading. I also had a little fun in the UI, for example adding a hook to automatically stretch the textarea as you type. *15/07/25: Since this I have instead created the text area as it's own component, simplifying the resizing.*

The next step was accessing the microphone, learning about navigator and mediaDevices on my way to setting up audio recording with MediaRecorder.
```

  function recordStream(stream: MediaStream) {
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      getRecording
    );
    mediaRecorderRef.current.start();
    setAudioState('recording');
    console.log(`Recording`);
  }

```

Setting up the recording wasn't as confusing as accessing it though: the media returns a blob, which I needed to turn into a file in order to give it a name and type, then into formData to send easily.  Audio blob -> file(to select name/type) -> formdata(to send for transcription) -> POST 

Having spent a considerable amount of time reading up on storing audiofiles vs text and possible APIs I could use for Speech to text all the while getting very little done, I got some extremely valuable advice to the effect of the best way to find
the answers is to try them out. I am currently using OpenAI's whisper API with the cheapest model v1. So far the accuracy is very good straight from the box, though thanks to the current heatwave and a loud fan the very first transcription read "Octopresses" instead of "Hot off the presses".

It did however extend the audio hand off -  the whole thing became: Audio blob -> file(to select name/type) -> formdata(to send) -> POST -> request -> formdata(to get) -> file(for toFile) -> buffer(for OpenAI). I was really glad to discover OpenAI's toFile: the FormData received by a Next.js API route can take several forms (Blob, File, etc.), but it’s not always in the exact format the OpenAI SDK expects. The SDK requires a Node.js File object with a buffer containing the file’s contents. The toFile helper converts the uploaded data into this compatible object, reading the entire file into memory as a buffer — whiich is why uploads are limited to 25MB (at time of writing). The resulting file object is then passed to OpenAI’s API for transcription. 

```
import { toFile } from 'openai/uploads';
...

  const bufferFile = await toFile(audioFile, 'audio.webm');

...

  const openai = new Openai();
  const transcription = await openai.audio.transcriptions.create({
    file: bufferFile,
    model: 'whisper-1',
  });


```

I also made it into a PWA in the hopes of doing away with the browser bar - you live and learn - there's always a bar if not a browser bar!


#### Continued Development

Next big addition will be the database.

#### Screenshots


<img width="240" height="341" alt="image" src="https://github.com/user-attachments/assets/7c3071a4-210c-455b-9a5f-77529f28d0b6" />
<img width="530" height="341" alt="image" src="https://github.com/user-attachments/assets/d5ed3a73-922c-424c-9f68-0aff127102e1" /><br/><br/>

<img width="770" height="955" alt="image" src="https://github.com/user-attachments/assets/247330a5-8201-40f6-855b-ec65ad16ff27" />








