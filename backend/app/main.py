# uvicorn app.main:app --reload
from fastapi import FastAPI
from dotenv import load_dotenv
from .routers import transcribe, memories
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(debug=False)
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://remnis.vercel.app/"
     ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

app.include_router(transcribe.router)
app.include_router(memories.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
