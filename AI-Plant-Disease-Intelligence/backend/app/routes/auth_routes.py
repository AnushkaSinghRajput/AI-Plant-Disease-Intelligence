"""Auth routes: Firebase token exchange and demo login."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.models import Token
from app.core.auth import create_access_token
from app.core.config import get_settings
from app.services.auth_service import create_jwt_for_firebase_user

router = APIRouter(prefix="/auth", tags=["auth"])


class FirebaseTokenRequest(BaseModel):
    id_token: str


class DemoLoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/demo-login", response_model=Token)
async def demo_login(data: DemoLoginRequest):
    """Demo login - no Firebase required. Accepts any email/password for local testing."""
    if not data.email or not data.password or len(data.password) < 4:
        raise HTTPException(status_code=400, detail="Email and password (min 4 chars) required")
    # Create JWT for demo user
    user_id = f"demo_{data.email.replace('@', '_').replace('.', '_')}"
    token_data = {"sub": user_id, "email": data.email, "is_admin": False}
    access_token = create_access_token(token_data)
    settings = get_settings()
    return Token(access_token=access_token, expires_in=settings.access_token_expire_minutes * 60)


@router.post("/login", response_model=Token)
async def login(data: FirebaseTokenRequest):
    """Exchange Firebase ID token for JWT."""
    try:
        access_token, expires_in = await create_jwt_for_firebase_user(data.id_token)
        return Token(access_token=access_token, expires_in=expires_in)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
