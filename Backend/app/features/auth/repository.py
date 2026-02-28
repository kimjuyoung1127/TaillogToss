"""
인증 리포지토리 — 사용자 DB 쿼리
Parity: AUTH-001
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import Dog, User


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_latest_dog_by_user(db: AsyncSession, user_id: UUID) -> Optional[Dog]:
    stmt = (
        select(Dog)
        .where(Dog.user_id == user_id)
        .order_by(desc(Dog.created_at))
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalars().first()
