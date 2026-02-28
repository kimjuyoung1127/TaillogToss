"""
인증 서비스 — 프로필 조회 + 계정 삭제
Toss Login은 Edge Function(login-with-toss)에서 처리, 여기선 Supabase Auth 기반 프로필만 관리
Parity: AUTH-001
"""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.features.auth import repository, schemas


async def get_my_profile(db: AsyncSession, user_id: str) -> schemas.UserResponse:
    """현재 사용자 프로필 + 최신 강아지 정보"""
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    user = await repository.get_user_by_id(db, uuid_obj)
    if not user:
        raise NotFoundException("User profile not found. Please complete onboarding.")

    response = schemas.UserResponse.model_validate(user)

    latest_dog = await repository.get_latest_dog_by_user(db, uuid_obj)
    if latest_dog:
        response.latest_dog_id = latest_dog.id
        response.latest_dog_name = latest_dog.name

    return response


async def delete_user_account(db: AsyncSession, user_id: str) -> None:
    """사용자 계정 + 관련 데이터 CASCADE 삭제"""
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    user = await repository.get_user_by_id(db, uuid_obj)
    if not user:
        raise NotFoundException("User not found")

    await db.delete(user)
    await db.commit()
