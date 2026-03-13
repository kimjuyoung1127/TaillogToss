"""
온보딩 서비스 — 설문 제출 처리
Parity: APP-001
"""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException
from app.features.onboarding import repository, schemas


async def submit_survey(
    db: AsyncSession,
    user_id: str,
    data: schemas.SurveySubmission,
) -> schemas.DogResponse:
    """설문 제출 → Dog + DogEnv + 시드 로그 생성"""
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    dog = await repository.create_dog_with_env(db, uuid_obj, data)
    return schemas.DogResponse.model_validate(dog)
