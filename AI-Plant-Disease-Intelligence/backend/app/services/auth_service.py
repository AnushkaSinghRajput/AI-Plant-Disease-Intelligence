"""Firebase Auth verification and JWT issuance."""
from typing import Optional
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.auth import create_access_token

settings = get_settings()
_firebase_app = None


def get_firebase_app():
    global _firebase_app
    if _firebase_app is None and settings.firebase_project_id:
        cred = credentials.Certificate({
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": settings.firebase_client_id,
        })
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


async def verify_firebase_token(id_token: str) -> dict:
    """Verify Firebase ID token and return decoded claims."""
    try:
        app = get_firebase_app()
        decoded = auth.verify_id_token(id_token, app=app)
        return decoded
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}",
        )


async def create_jwt_for_firebase_user(id_token: str) -> tuple[str, int]:
    """Verify Firebase token and issue our JWT. Returns (access_token, expires_in_seconds)."""
    claims = await verify_firebase_token(id_token)
    user_id = claims.get("uid")
    email = claims.get("email", "")
    # Admin check can be from Firestore or a list in config
    is_admin = claims.get("admin", False)
    token_data = {"sub": user_id, "email": email, "is_admin": is_admin}
    access_token = create_access_token(token_data)
    return access_token, get_settings().access_token_expire_minutes * 60
