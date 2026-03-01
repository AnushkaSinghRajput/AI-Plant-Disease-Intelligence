"""Model comparison, recommendation, and training logs API."""
import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Query

from pydantic import BaseModel

router = APIRouter(prefix="/models", tags=["models"])


def _load_comparison_data() -> List[dict]:
    base = Path(__file__).resolve().parent.parent.parent
    path = base / "data" / "model_comparison.json"
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


class RecommendationRequest(BaseModel):
    prioritize: str = "accuracy"  # accuracy | speed | size | mobile
    max_size_mb: Optional[float] = None
    max_inference_ms: Optional[int] = None
    min_accuracy: Optional[float] = None


@router.get("/comparison", response_model=List[dict])
async def get_model_comparison():
    """Get pre-trained architectures comparison with metrics."""
    return _load_comparison_data()


@router.get("/recommend")
async def recommend_model(
    prioritize: str = Query("accuracy", description="accuracy | speed | size | mobile"),
    max_size_mb: Optional[float] = Query(None),
    max_inference_ms: Optional[int] = Query(None),
    min_accuracy: Optional[float] = Query(None),
):
    """Smart model recommendation based on user constraints."""
    models = _load_comparison_data()
    if not models:
        return {"recommended": None, "reason": "No model data"}

    # Filter by constraints
    filtered = models
    if max_size_mb is not None:
        filtered = [m for m in filtered if m.get("model_size_mb", 0) <= max_size_mb]
    if max_inference_ms is not None:
        filtered = [m for m in filtered if m.get("inference_ms", 999) <= max_inference_ms]
    if min_accuracy is not None:
        filtered = [m for m in filtered if m.get("accuracy", 0) >= min_accuracy]

    if not filtered:
        fallback = next((m for m in models if m.get("id") == "mobilenetv2"), models[0])
        return {
            "recommended": fallback,
            "reason": "No model met all constraints; returning MobileNetV2 (mobile-friendly default)",
        }

    # Sort by priority
    if prioritize == "speed":
        filtered.sort(key=lambda x: x.get("inference_ms", 999))
        reason = "Prioritizing inference speed"
    elif prioritize == "size":
        filtered.sort(key=lambda x: x.get("model_size_mb", 999))
        reason = "Prioritizing model size"
    elif prioritize == "mobile":
        filtered.sort(key=lambda x: (x.get("inference_ms", 999) * 0.5 + x.get("model_size_mb", 999) * 0.5))
        reason = "Prioritizing mobile/edge deployment"
    else:
        filtered.sort(key=lambda x: -x.get("accuracy", 0))
        reason = "Prioritizing accuracy"

    return {"recommended": filtered[0], "alternatives": filtered[1:4], "reason": reason}


@router.get("/training-logs")
async def get_training_logs(limit: int = Query(50, ge=1, le=500)):
    """Stream/sample training logs for real-time display."""
    # Placeholder: return sample logs; real impl would stream from training process
    return {
        "logs": [
            {"epoch": 1, "loss": 2.12, "accuracy": 0.65, "val_loss": 1.98, "val_accuracy": 0.68},
            {"epoch": 2, "loss": 1.45, "accuracy": 0.78, "val_loss": 1.32, "val_accuracy": 0.75},
            {"epoch": 3, "loss": 1.02, "accuracy": 0.85, "val_loss": 1.05, "val_accuracy": 0.82},
            {"epoch": 4, "loss": 0.82, "accuracy": 0.89, "val_loss": 0.91, "val_accuracy": 0.86},
            {"epoch": 5, "loss": 0.68, "accuracy": 0.92, "val_loss": 0.82, "val_accuracy": 0.89},
        ],
        "model": "MobileNetV2",
        "status": "completed",
    }
