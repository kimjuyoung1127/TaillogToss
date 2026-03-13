"""
구독/결제 라우터 — Toss IAP 연동
결제 검증은 Edge Function(verify-iap-order) 전담. 여기는 구독 상태 조회/관리.
FE api/subscription.ts 매핑
Parity: IAP-001
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.shared.models import Subscription, TossOrder

router = APIRouter()


class SubscriptionResponse(BaseModel):
    """FE subscription.ts Subscription 미러"""
    id: UUID
    user_id: UUID
    plan_type: str
    is_active: bool
    ai_tokens_remaining: int = 0
    ai_tokens_total: int = 0
    next_billing_date: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class OrderHistoryResponse(BaseModel):
    id: UUID
    product_id: str
    toss_status: str
    grant_status: str
    amount: int
    created_at: str

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=Optional[SubscriptionResponse])
async def get_subscription(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """현재 구독 상태 조회"""
    q = select(Subscription).where(Subscription.user_id == UUID(user_id))
    result = (await db.execute(q)).scalars().first()
    if not result:
        return None
    return SubscriptionResponse.model_validate(result)


@router.get("/orders", response_model=list[OrderHistoryResponse])
async def get_order_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """주문 이력 조회"""
    from sqlalchemy import desc
    q = (
        select(TossOrder)
        .where(TossOrder.user_id == UUID(user_id))
        .order_by(desc(TossOrder.created_at))
        .limit(20)
    )
    results = (await db.execute(q)).scalars().all()
    return [OrderHistoryResponse.model_validate(r) for r in results]
