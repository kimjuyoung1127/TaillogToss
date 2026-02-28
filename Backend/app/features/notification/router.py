"""
알림 라우터 — 알림 이력 조회
발송은 Edge Function(send-smart-message) 전담. 여기는 이력 조회만.
FE api/notification.ts 매핑: getNotifications, markAsRead
Parity: MSG-001
"""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.shared.models import NotiHistory

router = APIRouter()


class NotificationResponse(BaseModel):
    """FE notification.ts NotificationHistory 미러"""
    id: UUID
    user_id: UUID
    notification_type: Optional[str] = None
    channel: str
    template_set_code: Optional[str] = None
    sent_at: datetime
    success: bool = True
    error_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """알림 이력 조회"""
    q = (
        select(NotiHistory)
        .where(NotiHistory.user_id == UUID(user_id))
        .order_by(desc(NotiHistory.sent_at))
        .limit(50)
    )
    results = (await db.execute(q)).scalars().all()
    return [NotificationResponse.model_validate(r) for r in results]


@router.patch("/{noti_id}/read")
async def mark_as_read(
    noti_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """알림 읽음 처리"""
    q = select(NotiHistory).where(
        NotiHistory.id == noti_id,
        NotiHistory.user_id == UUID(user_id),
    )
    noti = (await db.execute(q)).scalars().first()
    if noti:
        noti.read_at = datetime.now(timezone.utc)
        await db.commit()
    return {"success": True}
