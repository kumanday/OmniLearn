from sqlalchemy import Column, Integer, String, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Lesson(Base, TimestampMixin):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    subsection_id = Column(Integer, ForeignKey("subsections.id"), unique=True)
    content = Column(Text)
    multimedia_urls = Column(ARRAY(String), nullable=True)

    subsection = relationship("Subsection", back_populates="lesson")