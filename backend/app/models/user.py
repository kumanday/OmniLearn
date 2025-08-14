from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, ARRAY, JSON
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    google_sub = Column(String, unique=True, index=True, nullable=True)
    picture_url = Column(String, nullable=True)

    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProgress(Base, TimestampMixin):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    completed_subsections = Column(ARRAY(Integer), default=[])
    scores = Column(JSON, default={})  # subsection_id -> score

    user = relationship("User", back_populates="progress")