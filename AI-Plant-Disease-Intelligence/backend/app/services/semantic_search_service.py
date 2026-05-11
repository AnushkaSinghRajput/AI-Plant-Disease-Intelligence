"""Semantic search over plant disease database using embeddings."""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

# Optional: sentence-transformers (lazy import — avoids heavy torch/tf at app startup)
_data: List[Dict[str, Any]] = []
_embeddings: Optional[list] = None
_model = None


def _sentence_transformer_class():
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer
    except ImportError:
        return None


def _load_disease_database() -> List[Dict[str, Any]]:
    global _data
    if _data:
        return _data
    base = Path(__file__).resolve().parent.parent.parent
    db_path = base / "data" / "disease_database.json"
    if db_path.exists():
        with open(db_path) as f:
            _data = json.load(f)
    else:
        _data = _build_fallback_database()
    return _data


def _build_fallback_database() -> List[Dict[str, Any]]:
    """Fallback if no disease_database.json - use class names from labels."""
    labels_path = Path(__file__).resolve().parent.parent.parent.parent / "model" / "labels" / "class_names.json"
    if labels_path.exists():
        with open(labels_path) as f:
            classes = json.load(f)
        if isinstance(classes, list):
            return [{"id": str(i), "disease_name": c, "crop": c.split("___")[0] if "___" in c else "Unknown", "description": "", "treatments": []} for i, c in enumerate(classes)]
    return []


def _get_model():
    global _model
    if _model is not None:
        return _model
    ST = _sentence_transformer_class()
    if ST is None:
        return None
    try:
        from app.core.config import get_settings

        name = get_settings().embedding_model
        _model = ST(name)
    except Exception:
        _model = ST("all-MiniLM-L6-v2")
    return _model


def _compute_embeddings() -> Optional[list]:
    global _embeddings
    if _embeddings is not None:
        return _embeddings
    model = _get_model()
    if model is None:
        return None
    data = _load_disease_database()
    texts = [f"{d.get('disease_name','')} {d.get('crop','')} {d.get('description','')}" for d in data]
    _embeddings = model.encode(texts).tolist()
    return _embeddings


def search(query: str, limit: int = 20, filters: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
    """Semantic similarity search over disease database."""
    data = _load_disease_database()
    if not data:
        return []
    model = _get_model()
    if model is None:
        # Fallback: keyword match
        q = query.lower()
        scored = [(d, 1.0 if q in d.get("disease_name", "").lower() or q in d.get("crop", "").lower() else 0.5) for d in data]
        scored.sort(key=lambda x: -x[1])
        return [s[0] | {"similarity": s[1]} for s in scored[:limit]]
    emb = _compute_embeddings()
    if emb is None:
        return data[:limit]
    import numpy as np
    q_emb = model.encode([query])[0]
    sims = np.dot(emb, q_emb) / (np.linalg.norm(emb, axis=1) * np.linalg.norm(q_emb) + 1e-9)
    idx = np.argsort(-sims)[:limit]
    out = []
    for i in idx:
        d = dict(data[i])
        d["similarity"] = float(sims[i])
        if filters:
            if "crop" in filters and d.get("crop", "").lower() != filters["crop"].lower():
                continue
            if "region" in filters and filters["region"] not in str(d.get("region", "")):
                continue
        out.append(d)
    return out[:limit]
