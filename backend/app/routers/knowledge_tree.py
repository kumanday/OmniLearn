from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from app.schemas.knowledge_tree import KnowledgeTreeCreate, KnowledgeTreeResponse
from app.core.security import get_current_user
from app.services.knowledge_tree import KnowledgeTreeService

router = APIRouter()


@router.post("/", response_model=KnowledgeTreeResponse)
async def create_knowledge_tree(
    data: KnowledgeTreeCreate,
    service: KnowledgeTreeService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Generate a knowledge tree for a given topic.
    """
    try:
        return await service.generate_knowledge_tree(data.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{tree_id}", response_model=KnowledgeTreeResponse)
async def get_knowledge_tree(
    tree_id: int,
    service: KnowledgeTreeService = Depends(),
    current_user=Depends(get_current_user),
) -> Any:
    """
    Get a knowledge tree by ID.
    """
    tree = await service.get_knowledge_tree(tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Knowledge tree not found")
    return tree