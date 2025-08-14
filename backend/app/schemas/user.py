from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any


class UserBase(BaseModel):
    email: EmailStr
    name: str
    
    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int


class UserProgressUpdate(BaseModel):
    subsection_id: int
    completed: bool
    score: Optional[float] = None


class UserProgressResponse(BaseModel):
    user_id: int
    completed_subsections: List[int]
    scores: Dict[str, float]  # subsection_id -> score