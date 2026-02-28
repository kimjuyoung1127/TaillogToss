"""
온보딩 리포지토리 — Dog + DogEnv + 시드 로그 생성
DogCoach onboarding/repository.py 마이그레이션 (guest cookie 제거)
Parity: APP-001
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.onboarding import schemas
from app.shared.models import BehaviorLog, Dog, DogEnv, User


async def create_dog_with_env(
    db: AsyncSession,
    user_id: UUID,
    data: schemas.SurveySubmission,
) -> Dog:
    """Dog + DogEnv + 시드 BehaviorLog 생성 (JIT User 포함)"""
    # JIT User 생성
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user_record = result.scalars().first()
    if not user_record:
        user_record = User(id=user_id)
        db.add(user_record)
        await db.flush()

    # Dog 생성
    dog = Dog(
        user_id=user_id,
        name=data.name,
        breed=data.breed or None,
        birth_date=data.birth_date,
        sex=data.sex,
        weight_kg=data.weight_kg,
        profile_image_url=data.profile_image_url,
    )
    db.add(dog)
    await db.flush()  # dog.id 생성

    # DogEnv 생성 (JSONB 필드)
    dog_env = DogEnv(
        dog_id=dog.id,
        profile_meta=data.profile_meta.model_dump(mode="json"),
        household_info=data.household_info.model_dump(mode="json"),
        health_meta=data.health_meta.model_dump(mode="json"),
        rewards_meta=data.rewards_meta.model_dump(mode="json"),
        chronic_issues=data.chronic_issues.model_dump(mode="json"),
        triggers=data.triggers.model_dump(mode="json"),
        past_attempts=data.past_attempts.model_dump(mode="json"),
        temperament=data.temperament.model_dump(mode="json"),
        activity_meta=data.activity_meta.model_dump(mode="json"),
    )
    db.add(dog_env)

    # 시드 로그 (Cold Start)
    if data.chronic_issues.top_issues:
        first_issue = data.chronic_issues.top_issues[0]
        seed_log = BehaviorLog(
            dog_id=dog.id,
            is_quick_log=False,
            antecedent="설문조사 기반 초기 데이터",
            behavior=first_issue,
            consequence="초기 분석 대기중",
            intensity=5,
        )
        db.add(seed_log)

    await db.commit()
    await db.refresh(dog)
    return dog
