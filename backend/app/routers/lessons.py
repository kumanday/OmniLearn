from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from app.schemas.lesson import LessonCreate, LessonResponse
from app.core.security import get_current_user
from app.services.lesson import LessonService

router = APIRouter()


@router.post("/", response_model=LessonResponse)
async def create_lesson(
    data: LessonCreate,
    service: LessonService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Generate lesson content for a subsection.
    """
    try:
        return await service.generate_lesson(data.subsection_id, data.subsection_title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: int,
    service: LessonService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Get a lesson by ID.
    """
    lesson = await service.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/subsection/{subsection_id}", response_model=LessonResponse)
async def get_lesson_by_subsection(
    subsection_id: int,
    service: LessonService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Get a lesson by subsection ID. Auto-generates if it doesn't exist.
    """
    try:
        return await service.get_lesson_by_subsection(subsection_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get lesson: {str(e)}")