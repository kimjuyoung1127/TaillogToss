"""
AI 코칭 라우터 — 생성/목록/최신/피드백/비용
FE api/coaching.ts 매핑: getCoachings, getLatestCoaching, submitFeedback
Parity: AI-001
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.coaching import schemas, service
from app.shared.utils.ownership import verify_dog_ownership

router = APIRouter()


@router.post("/generate", response_model=schemas.CoachingResponse)
async def generate_coaching(
    request: schemas.CoachingRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """6블록 AI 코칭 생성"""
    await verify_dog_ownership(db, UUID(request.dog_id), user_id=user_id)
    return await service.generate_coaching(db, request)


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


@router.get("/cost/status", response_model=schemas.CostStatusResponse)
async def get_cost_status(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """AI 비용 현황 조회"""
    return await service.get_cost_status(db)
