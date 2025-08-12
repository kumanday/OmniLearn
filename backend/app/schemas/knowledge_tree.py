from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class HATEOASLink(BaseModel):
    href: str
    rel: str
    method: str = "GET"


class SubsectionBase(BaseModel):
    title: str
    description: str


class SubsectionCreate(SubsectionBase):
    pass


class SubsectionResponse(SubsectionBase):
    id: int
    section_id: int
    links: List[HATEOASLink] = []


class SectionBase(BaseModel):
    title: str
    description: str


class SectionCreate(SectionBase):
    subsections: List[SubsectionCreate]


class SectionResponse(SectionBase):
    id: int
    tree_id: int
    subsections: List[SubsectionResponse]
    links: List[HATEOASLink] = []


class KnowledgeTreeBase(BaseModel):
    topic: str


class KnowledgeTreeCreate(KnowledgeTreeBase):
    pass


class KnowledgeTreeResponse(KnowledgeTreeBase):
    id: int
    sections: List[SectionResponse]
    links: List[HATEOASLink] = []