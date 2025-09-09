# uvicorn app.main:app --reload
from fastapi import FastAPI
from .routers import transcribe, memories

app = FastAPI()
app.include_router(transcribe.router)
app.include_router(memories.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
