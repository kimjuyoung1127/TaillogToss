"""
강아지 소유권 검증 — B2C 소유자 + B2B 조직 배정자 확인
DogCoach ownership.py 마이그레이션 + B2B 확장
"""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import Dog, DogAssignment, OrgDog


async def verify_dog_ownership(
    db: AsyncSession,
    dog_id: UUID,
    user_id: Optional[str] = None,
) -> Dog:
    """
    강아지 소유권 확인. 소유자이거나 B2B 배정자이면 Dog 반환.
    404: 강아지 없음, 403: 접근 거부
    """
    stmt = select(Dog).where(Dog.id == dog_id)
    result = await db.execute(stmt)
    dog = result.scalar_one_or_none()

    if not dog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dog not found",
        )

    # B2C 소유자 확인
    if user_id and dog.user_id and str(dog.user_id) == user_id:
        return dog

    # B2B 배정자 확인 (dog_assignments 테이블)
    if user_id:
        assignment_stmt = (
            select(DogAssignment)
            .where(
                DogAssignment.dog_id == dog_id,
                DogAssignment.trainer_user_id == UUID(user_id),
                DogAssignment.status == "active",
            )
        )
        assignment_result = await db.execute(assignment_stmt)
        if assignment_result.scalar_one_or_none():
            return dog

        # B2B 조직 소속 강아지 + 조직 멤버 확인
        org_dog_stmt = (
            select(OrgDog)
            .where(OrgDog.dog_id == dog_id, OrgDog.status == "active")
        )
        org_dog_result = await db.execute(org_dog_stmt)
        org_dog = org_dog_result.scalar_one_or_none()
        if org_dog and org_dog.parent_user_id and str(org_dog.parent_user_id) == user_id:
            return dog

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied: you do not own this dog",
    )
