"""
행동 기록 리포지토리 — BehaviorLog CRUD
DogCoach log/repository.py 마이그레이션
Parity: LOG-001
"""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import BehaviorLog


async def create_log(db: AsyncSession, log_data: dict) -> BehaviorLog:
    new_log = BehaviorLog(**log_data)
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log


async def get_logs_by_dog(
    db: AsyncSession, dog_id: UUID, limit: int = 20, offset: int = 0,
) -> List[BehaviorLog]:
    """idx_logs_dog_occurred 인덱스 활용 최적화 쿼리"""
    stmt = (
        select(BehaviorLog)
        .where(BehaviorLog.dog_id == dog_id)
        .order_by(desc(BehaviorLog.occurred_at))
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_log_by_id(db: AsyncSession, log_id: UUID) -> Optional[BehaviorLog]:
    result = await db.execute(select(BehaviorLog).where(BehaviorLog.id == log_id))
    return result.scalar_one_or_none()


async def update_log(db: AsyncSession, log_id: UUID, updates: dict) -> Optional[BehaviorLog]:
    updates["updated_at"] = datetime.now(timezone.utc)
    stmt = (
        update(BehaviorLog)
        .where(BehaviorLog.id == log_id)
        .values(**updates)
    )
    await db.execute(stmt)
    await db.commit()
    return await get_log_by_id(db, log_id)


async def delete_log(db: AsyncSession, log_id: UUID) -> bool:
    log = await get_log_by_id(db, log_id)
    if not log:
        return False
    await db.delete(log)
    await db.commit()
    return True
