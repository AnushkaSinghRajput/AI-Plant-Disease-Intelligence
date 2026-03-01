"""Admin routes: analytics, model upload, user stats."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Optional

from app.core.auth import get_current_admin
from app.services.db_service import get_analytics_summary, get_all_predictions_for_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
async def analytics(current_user: dict = Depends(get_current_admin)):
    """Model usage, user count, prediction stats."""
    return get_analytics_summary()


@router.get("/predictions")
async def all_predictions(limit: int = 500, current_user: dict = Depends(get_current_admin)):
    """List recent predictions (admin)."""
    return get_all_predictions_for_admin(limit=limit)


@router.post("/model/upload")
async def upload_model(
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_admin),
):
    """Upload updated .h5 or .tflite model (optional, implement with caution)."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    if not (file.filename.endswith(".h5") or file.filename.endswith(".tflite")):
        raise HTTPException(status_code=400, detail="Only .h5 or .tflite allowed")
    # Save to disk and optionally reload model (implementation depends on app lifecycle)
    from app.core.config import get_settings
    import shutil
    from pathlib import Path
    settings = get_settings()
    path = Path(settings.model_path if file.filename.endswith(".h5") else settings.tflite_model_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"message": "Model uploaded. Restart server to load new model."}
