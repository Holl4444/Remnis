# The OpenAI Whisper transcription endpoint
from fastapi import APIRouter, File, UploadFile, HTTPException
from openai import OpenAI
from uuid import uuid4

router = APIRouter()

@router.post('/transcribe')
# Expect a file upload named audioFile in the form data, and provide it as an UploadFile object. (...) = required parameter
async def transcribe_recording(audioFile: UploadFile = File(...)):
    try:
        if not audioFile:
            # FastAPI handles 422 errors already which covers if there is no file handed in
            # Fast API pattern for showing user errors
            raise HTTPException(status_code=400, detail='Unsupported audio file format')
        # Read the file in as bytes - FastAPI handling things
        bufferFile = await audioFile.read()
        openai = OpenAI()
        transcription = openai.audio.transcriptions.create(
            #original filename: the bytes content we read: the content type (audio/webm)
            file = (audioFile.filename, bufferFile, audioFile.content_type),
            model = 'whisper-1',
            prompt = 'Personal memory story with common phrases and expressions',
            temperature = 0
        )

        return {
            'success': True,
            'text': transcription.text,
            'memId': str(uuid4())
        }
    except HTTPException as err:
        raise err
    except Exception as err:
        print("Transcribe error:", err)
        return {
            'success': False,
            'errorMessage': str(err)
        }