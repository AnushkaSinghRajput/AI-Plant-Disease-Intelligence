"""Remedies and severity from static JSON and optional Gemini."""
import json
from pathlib import Path
from typing import List, Optional

from app.core.config import get_settings

_settings = get_settings()
_REMEDIES: dict = {}
_SEVERITY_MAP: dict = {}


def _load_static_data():
    global _REMEDIES, _SEVERITY_MAP
    base = Path(__file__).resolve().parent.parent.parent  # backend/
    remedies_path = base / "data" / "remedies.json"
    if remedies_path.exists():
        with open(remedies_path) as f:
            _REMEDIES = json.load(f)
    severity_path = base / "data" / "severity.json"
    if severity_path.exists():
        with open(severity_path) as f:
            _SEVERITY_MAP = json.load(f)


def get_remedies(class_name: str, language: str = "en") -> List[str]:
    _load_static_data()
    key = class_name.strip().lower().replace(" ", "_")
    remedies = _REMEDIES.get(key, _REMEDIES.get(class_name, _REMEDIES.get("default", [])))
    if isinstance(remedies, list):
        return remedies[:5] if remedies else _REMEDIES.get("default", [])[:5]
    return remedies.get("en", remedies.get(language, []))[:5] if isinstance(remedies, dict) else []


def get_severity_estimate(class_name: str, confidence: float) -> str:
    _load_static_data()
    key = class_name.strip().lower().replace(" ", "_")
    sev = _SEVERITY_MAP.get(key, _SEVERITY_MAP.get(class_name, "moderate"))
    if confidence >= 0.9:
        return sev if isinstance(sev, str) else sev.get("high", "moderate")
    if confidence >= 0.7:
        return "moderate"
    return "low"


async def get_ai_remedies(class_name: str, language: str = "en") -> Optional[List[str]]:
    """Optional: call Gemini API for dynamic remedies."""
    if not _settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=_settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-pro")
        prompt = f"List 3-5 short, practical remedies for plant disease: {class_name}. Language: {language}. Return only bullet points."
        response = await model.generate_content_async(prompt)
        if response and response.text:
            lines = [l.strip().lstrip("- ").strip() for l in response.text.split("\n") if l.strip()]
            return lines[:5]
    except Exception:
        pass
    return None
