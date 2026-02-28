"""
인증 Pydantic 스키마 — FE types/auth.ts 미러
Parity: AUTH-001
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.shared.models import UserRole, UserStatus


class UserResponse(BaseModel):
    """FE auth.ts User 미러"""
    id: UUID
    toss_user_key: Optional[str] = None
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    pepper_version: int = 1
    timezone: str = "Asia/Seoul"
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # 추가 편의 필드
    latest_dog_id: Optional[UUID] = None
    latest_dog_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DeleteAccountResponse(BaseModel):
    success: bool = True
