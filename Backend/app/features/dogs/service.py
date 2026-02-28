"""
강아지 서비스 — 프로필 조회/수정/목록/추가/삭제
FE api/dog.ts 매핑: getDogs, getDog, createDog, updateDog, deleteDog
Parity: APP-001
"""
from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.features.dogs import schemas
from app.shared.models import Dog, DogEnv
from app.shared.utils.ownership import verify_dog_ownership


async def get_dog_list(db: AsyncSession, user_id: str) -> List[schemas.DogListItem]:
    """사용자의 전체 강아지 목록 (멀티독)"""
    uuid_obj = UUID(user_id)
    stmt = (
        select(Dog)
        .where(Dog.user_id == uuid_obj)
        .order_by(desc(Dog.created_at))
    )
    result = await db.execute(stmt)
    dogs = result.scalars().all()
    return [schemas.DogListItem.model_validate(d) for d in dogs]


async def get_dog_full_profile(db: AsyncSession, user_id: str, dog_id: UUID) -> schemas.DogProfileFull:
    """강아지 전체 프로필 (Dog + DogEnv)"""
    dog = await verify_dog_ownership(db, dog_id, user_id=user_id)

    env_result = await db.execute(select(DogEnv).where(DogEnv.dog_id == dog.id))
    env = env_result.scalars().first()

    return schemas.DogProfileFull(
        basic=schemas.DogBasic.model_validate(dog),
        household_info=env.household_info if env and env.household_info else {},
        health_meta=env.health_meta if env and env.health_meta else {},
        activity_meta=env.activity_meta if env and env.activity_meta else {},
        triggers=_extract_list(env.triggers if env else None),
        past_attempts=_extract_list(env.past_attempts if env else None),
        temperament=env.temperament if env and env.temperament else {},
        rewards_meta=env.rewards_meta if env and env.rewards_meta else {},
        chronic_issues=env.chronic_issues if env and env.chronic_issues else {},
        profile_meta=env.profile_meta if env and env.profile_meta else {},
    )


async def create_dog(db: AsyncSession, user_id: str, data: schemas.DogCreateRequest) -> schemas.DogListItem:
    """강아지 추가 (멀티독)"""
    uuid_obj = UUID(user_id)
    dog = Dog(
        user_id=uuid_obj,
        name=data.name,
        breed=data.breed,
        birth_date=data.birth_date,
        sex=data.sex,
        weight_kg=data.weight_kg,
    )
    db.add(dog)
    # DogEnv 빈 레코드 생성
    await db.flush()
    dog_env = DogEnv(dog_id=dog.id)
    db.add(dog_env)
    await db.commit()
    await db.refresh(dog)
    return schemas.DogListItem.model_validate(dog)


async def update_dog_profile(
    db: AsyncSession, user_id: str, dog_id: UUID, data: schemas.DogProfileUpdate,
) -> schemas.DogProfileFull:
    """강아지 프로필 부분 수정"""
    dog = await verify_dog_ownership(db, dog_id, user_id=user_id)

    # Dog 기본 정보 업데이트
    for field in ("name", "breed", "birth_date", "sex", "weight_kg", "profile_image_url"):
        value = getattr(data, field, None)
        if value is not None:
            setattr(dog, field, value)

    # DogEnv JSONB 업데이트
    env_result = await db.execute(select(DogEnv).where(DogEnv.dog_id == dog.id))
    env = env_result.scalars().first()
    if not env:
        env = DogEnv(dog_id=dog.id)
        db.add(env)

    for field in ("household_info", "health_meta", "activity_meta", "rewards_meta",
                   "chronic_issues", "triggers", "past_attempts", "temperament"):
        value = getattr(data, field, None)
        if value is not None:
            setattr(env, field, value)

    await db.commit()
    await db.refresh(dog)
    await db.refresh(env)
    return await get_dog_full_profile(db, user_id, dog_id)


async def delete_dog(db: AsyncSession, user_id: str, dog_id: UUID) -> None:
    """강아지 삭제 (CASCADE)"""
    dog = await verify_dog_ownership(db, dog_id, user_id=user_id)
    await db.delete(dog)
    await db.commit()


def _extract_list(data) -> list:
    """JSONB 데이터에서 리스트 추출 (신/구 형식 호환)"""
    if not data:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("ids", data.get("top_issues", []))
    return []
