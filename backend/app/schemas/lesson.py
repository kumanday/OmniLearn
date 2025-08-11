from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class LessonBase(BaseModel):
    content: str
    multimedia_urls: Optional[List[str]] = None


class LessonCreate(BaseModel):
    subsection_id: int
    subsection_title: str


class LessonResponse(LessonBase):
    id: int
    subsection_id: int