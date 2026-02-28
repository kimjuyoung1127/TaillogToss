"""
인증 라우터 — GET /me, DELETE /me
Toss Login은 Edge Function 전담 (login-with-toss). 게스트 cookie 미사용.
Parity: AUTH-001
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.auth import schemas, service

router = APIRouter()


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """현재 사용자 프로필 조회"""
    return await service.get_my_profile(db, user_id)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """계정 영구 삭제 (CASCADE)"""
    await service.delete_user_account(db, user_id)
    return None
