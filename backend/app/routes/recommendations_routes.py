"""Recommendation engine routes."""
from fastapi import APIRouter, Depends, Query
from app.core.auth import get_current_user
from app.services.recommendation_service import get_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/")
async def recommendations(
    disease: str = Query(...),
    crop: str = Query(...),
    region: str | None = Query(None),
    use_llm: bool = Query(False),
    language: str = Query("en"),
    current_user: dict = Depends(get_current_user),
):
    """Treatments, best practices, and linked research."""
    return await get_recommendations(disease, crop, region, use_llm, language)
