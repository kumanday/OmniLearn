from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.session import get_db
from app.models.knowledge_tree import KnowledgeTree, Section, Subsection
from app.schemas.knowledge_tree import KnowledgeTreeResponse, SectionResponse, SubsectionResponse
from app.services.ai import AIService


class KnowledgeTreeService:
    def __init__(
        self, 
        db: Session = Depends(get_db),
        ai_service: AIService = Depends(),
    ):
        self.db = db
        self.ai_service = ai_service

    async def generate_knowledge_tree(self, topic: str) -> KnowledgeTreeResponse:
        """Generate a knowledge tree for a given topic."""
        # Use AI to generate the knowledge tree structure
        tree_data = await self.ai_service.generate_knowledge_tree(topic)
        
        # Create the knowledge tree in the database
        db_tree = KnowledgeTree(topic=topic)
        self.db.add(db_tree)
        self.db.flush()
        
        sections = []
        for section_data in tree_data["sections"]:
            db_section = Section(
                tree_id=db_tree.id,
                title=section_data["title"],
                description=section_data["description"],
            )
            self.db.add(db_section)
            self.db.flush()
            
            subsections = []
            for subsection_data in section_data["subsections"]:
                db_subsection = Subsection(
                    section_id=db_section.id,
                    title=subsection_data["title"],
                    description=subsection_data["description"],
                )
                self.db.add(db_subsection)
                self.db.flush()
                
                subsections.append(
                    SubsectionResponse(
                        id=db_subsection.id,
                        section_id=db_section.id,
                        title=db_subsection.title,
                        description=db_subsection.description,
                    )
                )
            
            sections.append(
                SectionResponse(
                    id=db_section.id,
                    tree_id=db_tree.id,
                    title=db_section.title,
                    description=db_section.description,
                    subsections=subsections,
                )
            )
        
        self.db.commit()
        
        return KnowledgeTreeResponse(
            id=db_tree.id,
            topic=db_tree.topic,
            sections=sections,
        )

    async def get_knowledge_tree(self, tree_id: int) -> Optional[KnowledgeTreeResponse]:
        """Get a knowledge tree by ID."""
        db_tree = self.db.query(KnowledgeTree).filter(KnowledgeTree.id == tree_id).first()
        if not db_tree:
            return None
        
        sections = []
        for db_section in db_tree.sections:
            subsections = []
            for db_subsection in db_section.subsections:
                subsections.append(
                    SubsectionResponse(
                        id=db_subsection.id,
                        section_id=db_section.id,
                        title=db_subsection.title,
                        description=db_subsection.description,
                    )
                )
            
            sections.append(
                SectionResponse(
                    id=db_section.id,
                    tree_id=db_tree.id,
                    title=db_section.title,
                    description=db_section.description,
                    subsections=subsections,
                )
            )
        
        return KnowledgeTreeResponse(
            id=db_tree.id,
            topic=db_tree.topic,
            sections=sections,
        )