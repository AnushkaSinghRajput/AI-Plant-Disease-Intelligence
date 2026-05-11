"""Explainability routes: Grad-CAM heatmaps, feature importance."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image
import io
import base64

from app.core.auth import get_current_user
from app.services.explainability_service import compute_gradcam_heatmap, get_feature_importance

router = APIRouter(prefix="/explain", tags=["explainability"])


@router.post("/gradcam")
async def gradcam(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Generate Grad-CAM heatmap overlay for uploaded image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Image file required")
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Invalid image")
    b64 = compute_gradcam_heatmap(img)
    if b64 is None:
        raise HTTPException(503, "Grad-CAM not available (model or config)")
    return {"heatmap_base64": b64, "format": "png"}


@router.get("/feature-importance/{class_name}")
async def feature_importance(
    class_name: str,
    top_k: int = 5,
    current_user: dict = Depends(get_current_user),
):
    """Feature importance for a given disease class."""
    return get_feature_importance(class_name, top_k=top_k)
