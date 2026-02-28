"""
Pydantic 스키마 검증 테스트 — 직렬화/역직렬화 + 유효성
"""
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.features.auth.schemas import UserResponse
from app.features.coaching.schemas import (
    CoachingBlocks,
    CoachingRequest,
    FeedbackRequest,
)
from app.features.dogs.schemas import DogCreateRequest
from app.features.log.schemas import QuickLogCreate
from app.features.org.schemas import (
    EnrollDogRequest,
    OrgResponse,
    UpdateOrgRequest,
)
from app.features.report.schemas import (
    CreateInteractionRequest,
    DailyReportResponse,
    GenerateReportRequest,
)
from app.features.settings.schemas import (
    AiPersonaSchema,
    NotificationPrefSchema,
    UserSettingsUpdate,
)


class TestUserResponse:
    def test_valid_user(self):
        data = UserResponse(
            id=uuid4(),
            toss_user_key="toss_123",
            role="user",
            status="active",
            pepper_version=1,
            timezone="Asia/Seoul",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        assert data.role.value == "user"
        assert data.timezone == "Asia/Seoul"
        assert data.toss_user_key == "toss_123"


class TestCoachingSchemas:
    def test_coaching_request_defaults(self):
        req = CoachingRequest(dog_id="abc")
        assert req.report_type == "DAILY"
        assert req.window_days == 7

    def test_feedback_score_range(self):
        FeedbackRequest(score=1)
        FeedbackRequest(score=5)
        with pytest.raises(ValidationError):
            FeedbackRequest(score=0)
        with pytest.raises(ValidationError):
            FeedbackRequest(score=6)

    def test_coaching_blocks_defaults(self):
        blocks = CoachingBlocks()
        assert blocks.insight.title == ""
        assert blocks.action_plan.items == []
        assert blocks.dog_voice.emotion == "hopeful"
        assert blocks.risk_signals.overall_risk == "low"


class TestDogSchemas:
    def test_create_request_minimal(self):
        req = DogCreateRequest(name="멍멍이")
        assert req.name == "멍멍이"
        assert req.breed is None


class TestLogSchemas:
    def test_quick_log_required_fields(self):
        """QuickLogCreate 필수 필드 검증"""
        log = QuickLogCreate(
            dog_id=uuid4(),
            category="bark",
            intensity=5,
            occurred_at=datetime.now(timezone.utc),
        )
        assert log.category == "bark"
        assert log.intensity == 5

    def test_quick_log_missing_category(self):
        """category 누락 시 에러"""
        with pytest.raises(ValidationError):
            QuickLogCreate(
                dog_id=uuid4(),
                intensity=5,
                occurred_at=datetime.now(timezone.utc),
            )


class TestOrgSchemas:
    def test_enroll_dog_request(self):
        req = EnrollDogRequest(
            org_id="org1",
            dog_id="dog1",
            parent_name="김철수",
            parent_phone_enc="base64enc==",
        )
        assert req.group_tag == "default"

    def test_update_org_partial(self):
        req = UpdateOrgRequest(name="새이름")
        assert req.phone is None
        assert req.settings is None


class TestReportSchemas:
    def test_generate_report_request(self):
        req = GenerateReportRequest(
            dog_id="dog1",
            report_date="2026-02-28",
            template_type="daycare_general",
            created_by_org_id="org1",
        )
        assert req.created_by_trainer_id is None

    def test_create_interaction_request(self):
        req = CreateInteractionRequest(
            report_id="report1",
            interaction_type="like",
        )
        assert req.content is None


class TestSettingsSchemas:
    def test_notification_pref_defaults(self):
        """NotificationPrefSchema 기본값 (nested structure)"""
        pref = NotificationPrefSchema()
        assert pref.channels.push is True
        assert pref.channels.smart_message is True
        assert pref.quiet_hours.enabled is True
        assert pref.quiet_hours.start_hour == 22
        assert pref.quiet_hours.end_hour == 8

    def test_ai_persona_defaults(self):
        """AiPersonaSchema 기본값"""
        persona = AiPersonaSchema()
        assert persona.tone == "empathetic"
        assert persona.perspective == "coach"

    def test_settings_update_partial(self):
        update = UserSettingsUpdate(marketing_agreed=True)
        assert update.notification_pref is None
        assert update.ai_persona is None
