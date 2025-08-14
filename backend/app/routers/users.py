from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from app.schemas.user import UserCreate, UserResponse, UserProgressUpdate, UserProgressResponse
from app.core.security import get_current_user
from app.services.user import UserService

router = APIRouter()


@router.post("/", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(),
) -> Any:
    """
    Create a new user.
    """
    try:
        return await service.create_user(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Get a user by ID.
    """
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/progress", response_model=UserProgressResponse)
async def update_user_progress(
    user_id: int,
    data: UserProgressUpdate,
    service: UserService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Update a user's progress.
    """
    try:
        return await service.update_progress(user_id, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/progress", response_model=UserProgressResponse)
async def get_user_progress(
    user_id: int,
    service: UserService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Get a user's progress.
    """
    progress = await service.get_progress(user_id)
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")
    return progress