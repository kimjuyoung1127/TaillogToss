"""행동 분석 라우터 — GET /api/v1/dogs/{dog_id}/behavior-analytics, /step-attempts"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.shared.utils.ownership import verify_dog_ownership

from . import schemas, service

router = APIRouter()


@router.get("/{dog_id}/behavior-analytics", response_model=schemas.BehaviorAnalyticsResponse)
async def get_behavior_analytics(
    dog_id: UUID,
    days: int = Query(default=30, ge=7, le=90),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """강아지 행동 패턴 분석 — behavior_logs 직접 집계"""
    await verify_dog_ownership(db, dog_id, user_id=user_id)
    return await service.get_behavior_analytics(db, dog_id, days)


@router.get("/{dog_id}/step-attempts", response_model=List[schemas.StepAttemptResponse])
async def get_step_attempts(
    dog_id: UUID,
    step_id: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """시행착오 기록 조회 — training_step_attempts"""
    await verify_dog_ownership(db, dog_id, user_id=user_id)
    return await service.get_step_attempts(db, dog_id, step_id=step_id, limit=limit)
