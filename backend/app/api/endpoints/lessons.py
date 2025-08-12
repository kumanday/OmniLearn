from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from app.schemas.lesson import LessonCreate, LessonResponse
from app.services.lesson import LessonService

router = APIRouter()


@router.post("/", response_model=LessonResponse)
async def create_lesson(
    data: LessonCreate,
    service: LessonService = Depends(),
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
) -> Any:
    """
    Get a lesson by subsection ID. Auto-generates if it doesn't exist.
    """
    lesson = await service.get_lesson_by_subsection(subsection_id)
    if not lesson:
        # Auto-generate lesson if it doesn't exist
        try:
            from app.models.knowledge_tree import Subsection
            from app.db.session import get_db
            
            db = next(get_db())
            subsection = db.query(Subsection).filter(Subsection.id == subsection_id).first()
            if not subsection:
                raise HTTPException(status_code=404, detail="Subsection not found")
            
            lesson = await service.generate_lesson(subsection_id, subsection.title)
            return lesson
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate lesson: {str(e)}")
    return lesson