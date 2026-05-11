"""MongoDB access for predictions and users."""
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core.config import get_settings

settings = get_settings()
# Use sync pymongo for simplicity; motor for async if needed
try:
    from pymongo import MongoClient
    _client = MongoClient(settings.mongodb_uri)
    db = _client[settings.mongodb_db_name]
except Exception:
    db = None

PREDICTIONS_COLLECTION = "predictions"
USERS_COLLECTION = "users"
ANALYTICS_CACHE = "analytics_cache"


def save_prediction(
    user_id: str,
    image_url: str,
    predicted_class: str,
    confidence: float,
    severity: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> str:
    if db is None:
        return ""
    doc = {
        "user_id": user_id,
        "image_url": image_url,
        "predicted_class": predicted_class,
        "confidence": confidence,
        "severity": severity,
        "lat": lat,
        "lng": lng,
        "created_at": datetime.utcnow(),
    }
    r = db[PREDICTIONS_COLLECTION].insert_one(doc)
    return str(r.inserted_id)


def get_user_predictions(user_id: str, limit: int = 50) -> List[dict]:
    if db is None:
        return []
    cursor = (
        db[PREDICTIONS_COLLECTION]
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    return [
        {
            **_doc,
            "id": str(_doc["_id"]),
            "created_at": _doc["created_at"].isoformat() if hasattr(_doc["created_at"], "isoformat") else str(_doc["created_at"]),
        }
        for _doc in cursor
    ]


def get_all_predictions_for_admin(limit: int = 500) -> List[dict]:
    if db is None:
        return []
    cursor = db[PREDICTIONS_COLLECTION].find().sort("created_at", -1).limit(limit)
    return [
        {
            **{k: v for k, v in _doc.items() if k != "_id"},
            "id": str(_doc["_id"]),
        }
        for _doc in cursor
    ]


def get_analytics_summary() -> dict:
    if db is None:
        return {"total_predictions": 0, "unique_users": 0, "top_diseases": [], "predictions_by_day": []}
    total = db[PREDICTIONS_COLLECTION].count_documents({})
    unique_users = len(db[PREDICTIONS_COLLECTION].distinct("user_id"))
    pipeline_top = [
        {"$group": {"_id": "$predicted_class", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    top_diseases = list(db[PREDICTIONS_COLLECTION].aggregate(pipeline_top))
    pipeline_day = [
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 30},
    ]
    by_day = list(db[PREDICTIONS_COLLECTION].aggregate(pipeline_day))
    return {
        "total_predictions": total,
        "unique_users": unique_users,
        "top_diseases": [{"class": x["_id"], "count": x["count"]} for x in top_diseases],
        "predictions_by_day": [{"date": x["_id"], "count": x["count"]} for x in by_day],
    }


def upsert_user(uid: str, email: str, display_name: Optional[str] = None, is_admin: bool = False) -> None:
    if db is None:
        return
    db[USERS_COLLECTION].update_one(
        {"uid": uid},
        {
            "$set": {
                "email": email,
                "display_name": display_name,
                "is_admin": is_admin,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )


def get_user(uid: str) -> Optional[dict]:
    if db is None:
        return None
    doc = db[USERS_COLLECTION].find_one({"uid": uid})
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id", ""))
    return doc
