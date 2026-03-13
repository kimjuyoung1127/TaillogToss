"""
AI 코칭 라우터 — 생성/목록/최신/피드백/비용/사용량
FE api/coaching.ts 매핑: getCoachings, getLatestCoaching, submitFeedback, generateCoaching
Parity: AI-001
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.coaching import budget, schemas, service
from app.shared.utils.ownership import verify_dog_ownership

router = APIRouter()


@router.post("/generate", response_model=schemas.CoachingResponse)
async def generate_coaching(
    request: schemas.CoachingRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """6블록 AI 코칭 생성 — 버스트/일일 제한 적용"""
    await verify_dog_ownership(db, UUID(request.dog_id), user_id=user_id)

    # 버스트 제한 (2회/10분, 공통)
    burst_ok = await budget.check_user_burst_limit(db, user_id)
    if not burst_ok:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "잠시 후 다시 시도해 주세요",
                "remaining": 0,
                "retry_after_sec": 600,
            },
        )

    # 일일 제한 (구독 차등)
    daily_ok, used, limit = await budget.check_user_daily_limit(db, user_id)
    if not daily_ok:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "일일 코칭 한도에 도달했어요",
                "remaining": 0,
                "daily_used": used,
                "daily_limit": limit,
                "retry_after_sec": _seconds_until_midnight(),
            },
        )

    return await service.generate_coaching(db, request)


@router.get("/usage/daily", response_model=schemas.DailyUsageResponse)
async def get_daily_usage(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """사용자 일일 코칭 사용량"""
    _, used, limit = await budget.check_user_daily_limit(db, user_id)
    return schemas.DailyUsageResponse(used=used, limit=limit)


@router.get("/{dog_id}", response_model=List[schemas.CoachingResponse])
async def get_coachings(
    dog_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """코칭 목록 조회"""
    await verify_dog_ownership(db, dog_id, user_id=user_id)
    return await service.get_coaching_list(db, dog_id)


@router.get("/{dog_id}/latest", response_model=Optional[schemas.CoachingResponse])
async def get_latest_coaching(
    dog_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """최신 코칭 결과"""
    await verify_dog_ownership(db, dog_id, user_id=user_id)
    return await service.get_latest_coaching(db, dog_id)


@router.patch("/{coaching_id}/feedback", response_model=schemas.FeedbackResponse)
async def submit_feedback(
    coaching_id: UUID,
    data: schemas.FeedbackRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """코칭 피드백 제출 (1-5점)"""
    return await service.submit_feedback(db, coaching_id, data.score)


@router.patch("/{coaching_id}/actions/{action_item_id}", response_model=schemas.ActionTrackerResponse)
async def toggle_action_item(
    coaching_id: UUID,
    action_item_id: str,
    data: schemas.ActionToggleRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """액션 아이템 완료 토글"""
    return await service.toggle_action_item(db, coaching_id, action_item_id, data.is_completed)


@router.get("/cost/status", response_model=schemas.CostStatusResponse)
async def get_cost_status(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """AI 비용 현황 조회"""
    return await service.get_cost_status(db)


def _seconds_until_midnight() -> int:
    """자정까지 남은 초"""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta
    next_midnight = midnight + timedelta(days=1)
    return int((next_midnight - now).total_seconds())
