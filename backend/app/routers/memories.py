# CRUD endpoints for memory operations .. Create Delete so far
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel # Models are similar to TypeScipt interfaces
from typing import Optional, Union # For optional fields in the data model
from ..services.dynamo_db import create_memory

router = APIRouter()

# Pydantic models
class MemoryRequest(BaseModel):
    title: Optional[str] = None
    year: Optional[str] = None
    tagged: Optional[str] = None
    text_area: Optional[str] = None

class MemorySuccessResponse(BaseModel):
    success: bool
    memId: str

class MemoryErrorResponse(BaseModel):
    success: bool   
    error: int
    errorMessage: str

MemoryResponse = Union[MemorySuccessResponse, MemoryErrorResponse]

# Endpoint
@router.post('/memories', response_model=MemoryResponse)
async def create_memory_endpoint(memory: MemoryRequest):
    try:
        if not memory.text_area:
            raise HTTPException(status_code=400, detail='No memory text detected')
        #Call service function
        result = await create_memory(memory.model_dump()) # Takes memory (instance of MemoryRequest), converts to dictionary and passes to create_memory

        if result['success']:
            return MemorySuccessResponse(success=True, memId=result['id'])
        else:
            return MemoryErrorResponse(
            success=False,
            error=result.get('error', 500), # 500 is default code (server/database error) if no specific error found
            errorMessage=result.get('errorMessage', 'unknown error')
        )
    except HTTPException:
        raise

    except Exception as err:
        error_msg = f"{type(err).__name__}: An unexpected error occurred"
        return MemoryErrorResponse(
            success=False,
            error=500,
            errorMessage=error_msg
        )

@router.delete('/endpoint')
async def fake_delete():
    return {"message": "This is a placeholder"}