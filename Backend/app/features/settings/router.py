"""
설정 라우터 — GET / + PATCH /
FE api/settings.ts 매핑: getSettings, updateSettings
Parity: APP-001
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.settings import schemas, service

router = APIRouter()


@router.get("/", response_model=schemas.UserSettingsResponse)
async def get_settings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """설정 조회 (JIT 생성)"""
    return await service.get_settings_with_defaults(db, user_id)


@router.patch("/", response_model=schemas.UserSettingsResponse)
async def update_settings(
    updates: schemas.UserSettingsUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """설정 부분 업데이트"""
    return await service.update_settings(db, user_id, updates)
