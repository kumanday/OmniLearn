from fastapi import APIRouter

from app.api.endpoints import knowledge_tree, lessons, questions, users

api_router = APIRouter()
api_router.include_router(knowledge_tree.router, prefix="/knowledge-tree", tags=["knowledge-tree"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(users.router, prefix="/users", tags=["users"])