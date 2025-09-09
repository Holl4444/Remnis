# CRUD endpoints for memory operations .. Create Delete so far
from fastapi import APIRouter

router = APIRouter()

@router.post('/endpoint')
async def fake_post():
    return {"message": "This is a placeholder"}

@router.delete('/endpoint')
async def fake_delete():
    return {"message": "This is a placeholder"}