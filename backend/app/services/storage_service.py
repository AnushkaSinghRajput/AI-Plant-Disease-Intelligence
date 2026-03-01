"""Image upload to Firebase Storage or S3."""
import os
import uuid
from pathlib import Path
from typing import Optional

from app.core.config import get_settings

settings = get_settings()
_bucket = None


def _get_bucket():
    global _bucket
    if _bucket is not None:
        return _bucket
    if settings.firebase_storage_bucket:
        try:
            from firebase_admin import storage
            _bucket = storage.bucket(settings.firebase_storage_bucket)
            return _bucket
        except Exception:
            pass
    if settings.aws_access_key_id and settings.s3_bucket_name:
        try:
            import boto3
            s3 = boto3.client(
                "s3",
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region,
            )
            _bucket = s3
            return _bucket
        except Exception:
            pass
    return None


def upload_image(file_content: bytes, user_id: str, content_type: str = "image/jpeg") -> Optional[str]:
    """Upload image and return public URL. Falls back to local path if no cloud configured."""
    name = f"predictions/{user_id}/{uuid.uuid4().hex}.jpg"
    bucket = _get_bucket()
    if bucket is None:
        local_dir = Path("uploads") / user_id
        local_dir.mkdir(parents=True, exist_ok=True)
        path = local_dir / f"{uuid.uuid4().hex}.jpg"
        path.write_bytes(file_content)
        return f"/uploads/{user_id}/{path.name}"
    try:
        if hasattr(bucket, "blob"):  # Firebase
            blob = bucket.blob(name)
            blob.upload_from_string(file_content, content_type=content_type)
            blob.make_public()
            return blob.public_url
        else:  # S3
            import io
            bucket.upload_fileobj(
                io.BytesIO(file_content),
                settings.s3_bucket_name,
                name,
                ExtraArgs={"ContentType": content_type},
            )
            return f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{name}"
    except Exception:
        return None
