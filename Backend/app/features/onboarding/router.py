"""
온보딩 라우터 — POST /survey
Toss 미니앱: 인증 필수 (게스트 cookie 제거)
Parity: APP-001
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.features.onboarding import schemas, service

router = APIRouter()


@router.post("/survey", response_model=schemas.DogResponse, status_code=status.HTTP_201_CREATED)
async def submit_onboarding_survey(
    data: schemas.SurveySubmission,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """온보딩 설문 제출 → 강아지 프로필 생성"""
    return await service.submit_survey(db, user_id, data)
