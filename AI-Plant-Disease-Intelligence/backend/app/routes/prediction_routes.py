"""Prediction and history routes."""
import io
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image

from app.core.auth import get_current_user
from app.models import PredictionResult
from app.services.prediction_service import predict, get_class_names
from app.services.storage_service import upload_image
from app.services.db_service import save_prediction, get_user_predictions
from app.services.remedy_service import get_remedies, get_severity_estimate, get_ai_remedies

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/demo", response_model=PredictionResult)
async def demo_predict(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """Demo prediction - no auth required. Use for trying the platform without sign-in."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPG, PNG)")
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file")
    class_id, class_name, confidence = predict(image)
    severity = get_severity_estimate(class_name, confidence)
    remedies = get_remedies(class_name, language)
    return PredictionResult(
        class_id=class_id,
        class_name=class_name,
        confidence=confidence,
        severity_estimate=severity,
        remedies=remedies or [],
    )


@router.post("/upload", response_model=PredictionResult)
async def upload_and_predict(
    file: UploadFile = File(...),
    use_ai_remedies: bool = Form(False),
    language: str = Form("en"),
    current_user: dict = Depends(get_current_user),
):
    """Upload image, run prediction, store result, return diagnosis."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    class_id, class_name, confidence = predict(image)
    severity = get_severity_estimate(class_name, confidence)
    remedies = await get_ai_remedies(class_name, language) if use_ai_remedies else get_remedies(class_name, language)
    image_url = upload_image(contents, current_user["user_id"], file.content_type or "image/jpeg")
    if image_url:
        save_prediction(
            current_user["user_id"],
            image_url,
            class_name,
            confidence,
            severity=severity,
        )
    return PredictionResult(
        class_id=class_id,
        class_name=class_name,
        confidence=confidence,
        severity_estimate=severity,
        remedies=remedies or [],
    )


@router.get("/history")
async def history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Get current user's prediction history."""
    return get_user_predictions(current_user["user_id"], limit=limit)


@router.get("/classes")
async def classes():
    """Get list of class names the model predicts."""
    return {"classes": get_class_names()}
