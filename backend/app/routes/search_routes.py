"""Semantic search routes."""
from fastapi import APIRouter, Depends, Query
from app.core.auth import get_current_user
from app.services.semantic_search_service import search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=list)
async def semantic_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    crop: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Natural-language semantic search over plant disease database."""
    filters = {"crop": crop} if crop else None
    results = search(query=q, limit=limit, filters=filters)
    return results
