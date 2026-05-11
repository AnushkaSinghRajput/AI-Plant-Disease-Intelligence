"""Application configuration from environment."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings loaded from env."""

    # App
    app_name: str = "AI Plant Disease Intelligence Platform"
    debug: bool = False

    # Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Firebase
    firebase_project_id: str = ""
    firebase_private_key_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    firebase_client_id: str = ""
    firebase_storage_bucket: str = ""

    # MongoDB / Firestore
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "plant_disease_db"

    # S3
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket_name: str = ""
    s3_prediction_prefix: str = "predictions"

    # ML
    model_path: str = "./model/saved_models/plant_disease_mobilenet.h5"
    tflite_model_path: str = "./model/saved_models/plant_disease_mobilenet.tflite"
    label_json_path: str = "./model/labels/class_names.json"
    use_tflite: bool = False
    vit_model_path: str = ""  # Optional ViT hybrid
    enable_gradcam: bool = True

    # Queue (Celery / Redis)
    redis_url: str = "redis://localhost:6379/0"
    celery_broker: str = "redis://localhost:6379/1"

    # Semantic Search
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    vector_collection: str = "disease_embeddings"

    # LLM / Recommendations
    gemini_api_key: str = ""
    openai_api_key: str = ""

    # Monitoring
    prometheus_enabled: bool = True
    sentry_dsn: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
