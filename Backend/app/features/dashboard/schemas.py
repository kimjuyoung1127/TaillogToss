"""
대시보드 Pydantic 스키마 — DogCoach dashboard/schemas.py 마이그레이션
Parity: APP-001
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class QuickLogStats(BaseModel):
    total_logs: int
    current_streak: int
    last_logged_at: Optional[datetime] = None


class RecentLogItem(BaseModel):
    id: UUID
    is_quick_log: bool = False
    quick_category: Optional[str] = None
    behavior: Optional[str] = None
    intensity: int
    occurred_at: datetime
    antecedent: Optional[str] = None
    consequence: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardDogProfile(BaseModel):
    id: UUID
    name: str
    breed: Optional[str] = None
    age_months: Optional[int] = None
    weight_kg: Optional[float] = None
    profile_image_url: Optional[str] = None


class DashboardResponse(BaseModel):
    dog_profile: DashboardDogProfile
    stats: QuickLogStats
    recent_logs: List[RecentLogItem]
    issues: List[str] = []
    env_triggers: List[str] = []
    # 환경 메타데이터
    env_info: Optional[Dict[str, Any]] = None
    health_meta: Optional[Dict[str, Any]] = None
    profile_meta: Optional[Dict[str, Any]] = None
