"""
Supabase 원격 인증 — JWT 토큰을 Supabase Auth API로 검증
DogCoach security.py 마이그레이션
"""
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client, create_client

from app.core.config import settings

logger = logging.getLogger(__name__)

# Supabase 클라이언트 (anon key로 auth.getUser 호출)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """인증 필수 — 유효하지 않으면 401"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise ValueError("User not found")
        return user_response.user.id
    except Exception as e:
        logger.warning("Auth verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id_optional(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[str]:
    """인증 선택 — 토큰 없거나 무효하면 None (게스트 허용)"""
    if not token:
        return None
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            return None
        return user_response.user.id
    except Exception:
        return None
