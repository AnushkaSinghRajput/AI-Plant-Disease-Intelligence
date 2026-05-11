"""Recommendation engine for treatments, best practices, linked research."""
import json
from pathlib import Path
from typing import List, Optional
from app.core.config import get_settings
from app.services.remedy_service import get_remedies
from app.services.remedy_service import get_ai_remedies

_settings = get_settings()
_research_db: Optional[dict] = None


def _load_research_db() -> dict:
    global _research_db
    if _research_db is not None:
        return _research_db
    base = Path(__file__).resolve().parent.parent.parent
    path = base / "data" / "research_links.json"
    if path.exists():
        with open(path) as f:
            _research_db = json.load(f)
    else:
        _research_db = {}
    return _research_db


async def get_recommendations(disease: str, crop: str, region: Optional[str] = None, use_llm: bool = False, language: str = "en") -> dict:
    """Return treatments, best practices, and linked research."""
    remedies = get_remedies(disease, language)
    if use_llm and _settings.gemini_api_key:
        try:
            ai = await get_ai_remedies(disease, language)
            if ai:
                remedies = ai
        except Exception:
            pass
    research = _load_research_db()
    key = disease.replace(" ", "_").lower()
    links = research.get(key, research.get(disease, []))
    best_practices = _get_best_practices(crop, disease)
    return {
        "treatments": remedies,
        "best_practices": best_practices,
        "linked_research": links if isinstance(links, list) else links.get("urls", []),
    }


def _get_best_practices(crop: str, disease: str) -> List[str]:
    base = Path(__file__).resolve().parent.parent.parent
    path = base / "data" / "best_practices.json"
    if not path.exists():
        return [
            "Ensure proper spacing for air circulation",
            "Avoid overhead watering",
            "Remove infected plant debris",
            "Rotate crops regularly",
            "Use disease-free seeds when available",
        ]
    with open(path) as f:
        data = json.load(f)
    crop_key = crop.lower().replace(" ", "_")
    practices = data.get(crop_key, data.get("default", []))
    return practices[:5] if isinstance(practices, list) else []
