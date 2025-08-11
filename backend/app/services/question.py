from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.session import get_db
from app.models.question import Question
from app.models.knowledge_tree import Section
from app.schemas.question import QuestionResponse, AnswerFeedback
from app.services.ai import AIService


class QuestionService:
    def __init__(
        self, 
        db: Session = Depends(get_db),
        ai_service: AIService = Depends(),
    ):
        self.db = db
        self.ai_service = ai_service

    async def generate_questions(
        self, section_id: int, section_title: str, difficulty: str = "medium"
    ) -> List[QuestionResponse]:
        """Generate practice questions for a section."""
        # Check if the section exists
        db_section = self.db.query(Section).filter(Section.id == section_id).first()
        if not db_section:
            raise ValueError(f"Section with ID {section_id} not found")
        
        # Use AI to generate the questions
        questions_data = await self.ai_service.generate_questions(
            section_title, db_section.description, difficulty
        )
        
        # Create the questions in the database
        question_responses = []
        for question_data in questions_data:
            db_question = Question(
                section_id=section_id,
                text=question_data["text"],
                difficulty=question_data["difficulty"],
                correct_answer=question_data["correct_answer"],
            )
            self.db.add(db_question)
            self.db.flush()
            
            question_responses.append(
                QuestionResponse(
                    id=db_question.id,
                    section_id=db_question.section_id,
                    text=db_question.text,
                    difficulty=db_question.difficulty,
                    correct_answer=db_question.correct_answer,
                )
            )
        
        self.db.commit()
        
        return question_responses

    async def get_questions_by_section(
        self, section_id: int, difficulty: Optional[str] = None
    ) -> List[QuestionResponse]:
        """Get questions for a section, optionally filtered by difficulty."""
        query = self.db.query(Question).filter(Question.section_id == section_id)
        if difficulty:
            query = query.filter(Question.difficulty == difficulty)
        
        db_questions = query.all()
        
        return [
            QuestionResponse(
                id=db_question.id,
                section_id=db_question.section_id,
                text=db_question.text,
                difficulty=db_question.difficulty,
                correct_answer=db_question.correct_answer,
            )
            for db_question in db_questions
        ]

    async def evaluate_answer(self, question_id: int, answer: str) -> AnswerFeedback:
        """Evaluate a student's answer to a question."""
        # Get the question
        db_question = self.db.query(Question).filter(Question.id == question_id).first()
        if not db_question:
            raise ValueError(f"Question with ID {question_id} not found")
        
        # Use AI to evaluate the answer
        evaluation = await self.ai_service.evaluate_answer(
            db_question.text, db_question.correct_answer, answer
        )
        
        return AnswerFeedback(
            is_correct=evaluation["is_correct"],
            feedback=evaluation["feedback"],
            correct_answer=db_question.correct_answer if not evaluation["is_correct"] else None,
        )