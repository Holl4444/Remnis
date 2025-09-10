# uvicorn app.main:app --reload
from fastapi import FastAPI
from dotenv import load_dotenv
import os
# Needs to run before from .routers import transcribe, memories because in dynamo_db.py -> dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION')) runs immediately
# Load .env.local from the project root (parent directory)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))
from .routers import transcribe, memories
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(debug=False)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://remnis.vercel.app"
     ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"REQUEST: {request.method} {request.url}")
    response = await call_next(request)
    print(f"RESPONSE: {response.status_code}")
    return response

# Connect routers to FastAPI
app.include_router(transcribe.router)
app.include_router(memories.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
