from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class HATEOASLink(BaseModel):
    href: str
    rel: str
    method: str = "GET"


class LessonBase(BaseModel):
    content: str
    multimedia_urls: Optional[List[str]] = None


class LessonCreate(BaseModel):
    subsection_id: int
    subsection_title: str


class LessonResponse(LessonBase):
    id: int
    subsection_id: int
    section_id: int
    section_title: str
    links: List[HATEOASLink] = []