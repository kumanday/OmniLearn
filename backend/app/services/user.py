from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json

from app.db.session import get_db
from app.models.user import User, UserProgress
from app.schemas.user import UserCreate, UserResponse, UserProgressUpdate, UserProgressResponse
from app.core.security import get_password_hash


class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user."""
        # Check if the user already exists
        db_user = self.db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise ValueError(f"User with email {user_data.email} already exists")
        
        # Create the user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
        )
        self.db.add(db_user)
        self.db.flush()
        
        # Create empty progress for the user
        db_progress = UserProgress(
            user_id=db_user.id,
            completed_subsections=[],
            scores={},
        )
        self.db.add(db_progress)
        
        self.db.commit()
        self.db.refresh(db_user)
        
        return UserResponse(
            id=db_user.id,
            email=db_user.email,
            name=db_user.name,
        )

    async def get_user(self, user_id: int) -> Optional[UserResponse]:
        """Get a user by ID."""
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        return UserResponse(
            id=db_user.id,
            email=db_user.email,
            name=db_user.name,
        )

    async def update_progress(
        self, user_id: int, progress_data: UserProgressUpdate
    ) -> UserProgressResponse:
        """Update a user's progress."""
        # Check if the user exists
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Get or create the user's progress
        db_progress = self.db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not db_progress:
            db_progress = UserProgress(
                user_id=user_id,
                completed_subsections=[],
                scores={},
            )
            self.db.add(db_progress)
            self.db.flush()
        
        # Update the progress
        subsection_id_str = str(progress_data.subsection_id)
        
        if progress_data.completed:
            if progress_data.subsection_id not in db_progress.completed_subsections:
                db_progress.completed_subsections.append(progress_data.subsection_id)
        
        if progress_data.score is not None:
            scores = db_progress.scores if db_progress.scores else {}
            scores[subsection_id_str] = progress_data.score
            db_progress.scores = scores
        
        self.db.commit()
        self.db.refresh(db_progress)
        
        return UserProgressResponse(
            user_id=db_progress.user_id,
            completed_subsections=db_progress.completed_subsections,
            scores=db_progress.scores,
        )

    async def get_progress(self, user_id: int) -> Optional[UserProgressResponse]:
        """Get a user's progress."""
        db_progress = self.db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not db_progress:
            return None
        
        return UserProgressResponse(
            user_id=db_progress.user_id,
            completed_subsections=db_progress.completed_subsections,
            scores=db_progress.scores,
        )