from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.session import get_db
from app.models.lesson import Lesson
from app.models.knowledge_tree import Subsection
from app.schemas.lesson import LessonResponse, HATEOASLink
from app.services.ai import AIService


class LessonService:
    def __init__(
        self, 
        db: Session = Depends(get_db),
        ai_service: AIService = Depends(),
    ):
        self.db = db
        self.ai_service = ai_service

    def _add_hateoas_links(self, lesson: LessonResponse, subsection: Subsection) -> LessonResponse:
        """Add HATEOAS links to lesson response."""
        lesson.links = [
            HATEOASLink(
                href=f"/api/v1/lessons/{lesson.id}",
                rel="self",
                method="GET"
            ),
            HATEOASLink(
                href=f"/api/v1/questions/section/{subsection.section_id}",
                rel="practice-questions",
                method="GET"
            ),
            HATEOASLink(
                href="/api/v1/questions/",
                rel="create-questions",
                method="POST"
            )
        ]
        return lesson

    async def generate_lesson(self, subsection_id: int, subsection_title: str) -> LessonResponse:
        """Generate lesson content for a subsection."""
        # Check if the subsection exists
        db_subsection = self.db.query(Subsection).filter(Subsection.id == subsection_id).first()
        if not db_subsection:
            raise ValueError(f"Subsection with ID {subsection_id} not found")
        
        # Use AI to generate the lesson content
        content = await self.ai_service.generate_lesson_content(
            subsection_title, db_subsection.description
        )
        
        # Generate multimedia content if enabled
        multimedia_urls = []
        if self.ai_service.enable_multimedia:
            multimedia_urls = await self.ai_service.generate_multimedia(
                subsection_title, content
            )
        
        # Create or update the lesson in the database
        db_lesson = self.db.query(Lesson).filter(Lesson.subsection_id == subsection_id).first()
        if db_lesson:
            db_lesson.content = content
            db_lesson.multimedia_urls = multimedia_urls
        else:
            db_lesson = Lesson(
                subsection_id=subsection_id,
                content=content,
                multimedia_urls=multimedia_urls,
            )
            self.db.add(db_lesson)
        
        self.db.commit()
        self.db.refresh(db_lesson)
        
        response = LessonResponse(
            id=db_lesson.id,
            subsection_id=db_lesson.subsection_id,
            section_id=db_subsection.section_id,
            section_title=db_subsection.section.title,
            content=db_lesson.content,
            multimedia_urls=db_lesson.multimedia_urls,
        )
        
        return self._add_hateoas_links(response, db_subsection)

    async def get_lesson(self, lesson_id: int) -> Optional[LessonResponse]:
        """Get a lesson by ID."""
        db_lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not db_lesson:
            return None
        
        # Get subsection for HATEOAS links
        db_subsection = self.db.query(Subsection).filter(Subsection.id == db_lesson.subsection_id).first()
        
        response = LessonResponse(
            id=db_lesson.id,
            subsection_id=db_lesson.subsection_id,
            section_id=db_subsection.section_id,
            section_title=db_subsection.section.title,
            content=db_lesson.content,
            multimedia_urls=db_lesson.multimedia_urls,
        )
        
        return self._add_hateoas_links(response, db_subsection)

    async def get_lesson_by_subsection(self, subsection_id: int) -> LessonResponse:
        """Get a lesson by subsection ID. Auto-generates if it doesn't exist."""
        db_lesson = self.db.query(Lesson).filter(Lesson.subsection_id == subsection_id).first()
        if not db_lesson:
            # Auto-generate if missing
            db_subsection = self.db.query(Subsection).filter(Subsection.id == subsection_id).first()
            if not db_subsection:
                raise ValueError(f"Subsection with ID {subsection_id} not found")
            return await self.generate_lesson(subsection_id, db_subsection.title)

        # Get subsection for HATEOAS links
        db_subsection = self.db.query(Subsection).filter(Subsection.id == db_lesson.subsection_id).first()

        response = LessonResponse(
            id=db_lesson.id,
            subsection_id=db_lesson.subsection_id,
            section_id=db_subsection.section_id,
            section_title=db_subsection.section.title,
            content=db_lesson.content,
            multimedia_urls=db_lesson.multimedia_urls,
        )

        return self._add_hateoas_links(response, db_subsection)
