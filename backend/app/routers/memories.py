# CRUD endpoints for memory operations .. Create Post and Delete so far
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field # Models are similar to TypeScipt interfaces
from typing import Optional, Union # For optional fields in the data model
from ..services.dynamo_db import create_memory, delete_memory

router = APIRouter()

# Pydantic models
class MemoryRequest(BaseModel):
    title: Optional[str] = None
    year: Optional[str] = None
    tagged: Optional[str] = None
    text_area: Optional[str] = Field(alias='text-area') # js -> python updates primary field name
    # enables accepting field names in snake, camel and JSON cases
    class Config:
        validate_by_name = True

class MemorySuccessResponse(BaseModel):
    success: bool
    memId: str

class MemoryErrorResponse(BaseModel):
    success: bool   
    error: int
    errorMessage: str

MemoryResponse = Union[MemorySuccessResponse, MemoryErrorResponse]

class MemoryData(BaseModel):
    mem_id: strtext_are

# Endpoint
@router.post('/memories', response_model=MemoryResponse)
async def create_memory_endpoint(memory: MemoryRequest):
    print("POST /memories")
    
    try:
        if not memory.text_area:
            raise HTTPException(status_code=400, detail='No memory text detected')
        
        result = await create_memory(memory.model_dump())

        if result['success']:
            print(f'Created memory: {result["id"]}')
            return MemorySuccessResponse(success=True, memId=result['id'])
        else:
            raise HTTPException(status_code=result.get('error', 500), detail=result.get('errorMessage', 'unknown error'))
    except HTTPException:
        raise
    except Exception as err:
        print(f'Exception: {err}')
        error_msg = f'{type(err).__name__}: An unexpected error occurred'
        raise HTTPException(status_code=500, detail=error_msg)

@router.delete('/memories/{mem_id}', response_model=MemoryResponse)
async def delete_memory_endpoint(mem_id: str):
    try:
        print(f"DELETE /memories/{mem_id}")
        result = await delete_memory(mem_id)

        if result['success']:
            print(f"Deleted memory: {result['id']}")
            return MemorySuccessResponse(success=True, memId=result['id'])
        else:
            print(f"Delete failed: {result}")
            return MemoryErrorResponse(
                success=False,
                error=result.get('error', 404),
                errorMessage=result.get('errorMessage', 'Memory not found')
            )
    except HTTPException:
        raise
    except Exception as err:
        print(f"Exception: {err}")
        error_msg = f'{type(err).__name__}: An unexpected error occurred'
        return MemoryErrorResponse(
            success=False,
            error=500,
            errorMessage=error_msg
        )
    
    @router.get(f'/memories', response_model=)