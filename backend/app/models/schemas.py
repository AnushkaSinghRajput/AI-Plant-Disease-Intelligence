"""Pydantic schemas for API request/response."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    farmer = "farmer"
    researcher = "researcher"
    agronomist = "agronomist"
    admin = "admin"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_role: Optional[str] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: UserRole = UserRole.farmer


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    role: UserRole = UserRole.farmer


class UserResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    role: UserRole = UserRole.farmer
    badges: List[str] = []
    created_at: Optional[datetime] = None


class PredictionResult(BaseModel):
    class_id: str
    class_name: str
    confidence: float
    severity_estimate: Optional[str] = None
    remedies: Optional[List[str]] = None
    report_url: Optional[str] = None
    job_id: Optional[str] = None
    gradcam_url: Optional[str] = None
    feature_importance: Optional[Dict[str, float]] = None


class SearchQuery(BaseModel):
    query: str
    limit: int = 20
    filters: Optional[Dict[str, Any]] = None


class SearchResult(BaseModel):
    id: str
    disease_name: str
    crop: str
    similarity: float
    description: Optional[str] = None
    treatments: List[str] = []


class AnalyticsRequest(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    region: Optional[str] = None
    crop: Optional[str] = None


class RecommendationRequest(BaseModel):
    disease: str
    crop: str
    region: Optional[str] = None
    use_llm: bool = False


class PredictionLog(BaseModel):
    id: Optional[str] = None
    user_id: str
    image_url: str
    predicted_class: str
    confidence: float
    severity: Optional[str] = None
    created_at: datetime
    lat: Optional[float] = None
    lng: Optional[float] = None


class AnalyticsSummary(BaseModel):
    total_predictions: int
    unique_users: int
    top_diseases: List[dict]
    predictions_by_day: List[dict]
