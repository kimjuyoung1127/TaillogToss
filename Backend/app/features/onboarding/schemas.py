"""
온보딩 설문 Pydantic 스키마 — FE types/dog.ts SurveyData 미러
DogCoach onboarding/schemas.py 마이그레이션
Parity: APP-001
"""
from datetime import date
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, model_validator

from app.shared.models import DogSex


# JSONB 필드 서브모델

class ProfileMeta(BaseModel):
    weight_kg: Optional[float] = None
    adoption_date: Optional[date] = None


class HouseholdInfo(BaseModel):
    """FE dog.ts HouseholdInfo 미러"""
    members_count: Optional[int] = None
    has_children: bool = False
    has_other_pets: bool = False
    living_type: Optional[str] = None  # apartment | house | villa | other


class HealthMeta(BaseModel):
    """FE dog.ts HealthMeta 미러"""
    chronic_issues: List[str] = []
    medications: List[str] = []
    vet_notes: Optional[str] = None


class ActivityMeta(BaseModel):
    """FE dog.ts ActivityMeta 미러"""
    daily_walk_minutes: int = 0
    exercise_level: Optional[str] = None  # low | medium | high
    favorite_activities: List[str] = []


class RewardsMeta(BaseModel):
    ids: List[str] = []
    other_text: Optional[str] = None
    play_style: Optional[str] = None


class ChronicIssues(BaseModel):
    top_issues: List[str] = []
    other_text: Optional[str] = None


class TriggersInfo(BaseModel):
    ids: List[str] = []
    other_text: Optional[str] = None


class PastAttemptsInfo(BaseModel):
    ids: List[str] = []
    other_text: Optional[str] = None


class Temperament(BaseModel):
    sensitivity_score: Optional[int] = None  # 1-5
    energy_level: Optional[int] = None  # 1-5


# 설문 제출 모델

class SurveySubmission(BaseModel):
    """7단계 온보딩 설문 — FE dog.ts SurveyData 미러"""
    # Step 1: 기본 정보 (필수: name)
    name: str
    breed: str = ""
    birth_date: Optional[date] = None
    sex: Optional[DogSex] = None
    weight_kg: Optional[float] = None
    profile_meta: ProfileMeta = ProfileMeta()

    # Step 2: 생활 환경
    household_info: HouseholdInfo = HouseholdInfo()

    # Step 3: 건강/영양
    health_meta: HealthMeta = HealthMeta()
    rewards_meta: RewardsMeta = RewardsMeta()

    # Step 4: 행동 문제 (필수)
    chronic_issues: ChronicIssues

    # Step 5: 트리거 (필수)
    triggers: TriggersInfo

    # Step 6: 과거 시도
    past_attempts: PastAttemptsInfo = PastAttemptsInfo()

    # Step 7: 기질/활동
    temperament: Temperament = Temperament()
    activity_meta: ActivityMeta = ActivityMeta()

    profile_image_url: Optional[str] = None

    @model_validator(mode="after")
    def validate_core_behavior(self):
        if not self.chronic_issues.top_issues:
            raise ValueError("최소 1개 이상의 행동 문제를 선택해주세요")
        if not self.triggers.ids:
            raise ValueError("최소 1개 이상의 트리거를 선택해주세요")
        return self

    @staticmethod
    def _sanitize(data: Any) -> Any:
        if isinstance(data, dict):
            return {k: SurveySubmission._sanitize(v) for k, v in data.items()}
        if isinstance(data, list):
            return [SurveySubmission._sanitize(v) for v in data]
        if data == "":
            return None
        return data

    @model_validator(mode="before")
    @classmethod
    def check_empty_strings(cls, data: Any) -> Any:
        return cls._sanitize(data)


class DogResponse(BaseModel):
    """강아지 생성 응답"""
    id: UUID
    name: str
    breed: Optional[str] = None
    created_at: Any

    model_config = ConfigDict(from_attributes=True)
