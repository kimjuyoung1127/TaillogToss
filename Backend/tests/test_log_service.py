"""
행동 기록 서비스 검증 테스트 — B2B 빠른기록 필드 보존
"""
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.features.log.schemas import QuickLogCreate
from app.features.log.service import create_quick_log


@pytest.mark.asyncio
async def test_create_quick_log_preserves_b2b_org_fields():
    dog_id = uuid4()
    org_id = uuid4()
    recorded_by = uuid4()
    occurred_at = datetime.now(timezone.utc)
    db = AsyncMock()

    async def fake_create_log(_db, log_data):
        now = datetime.now(timezone.utc)
        return SimpleNamespace(
            id=uuid4(),
            daily_activity=None,
            type_id=None,
            antecedent=None,
            behavior=None,
            consequence=None,
            created_at=now,
            updated_at=now,
            **log_data,
        )

    with patch("app.features.log.repository.create_log", side_effect=fake_create_log) as create_log_mock:
        result = await create_quick_log(
            db,
            QuickLogCreate(
                dog_id=dog_id,
                category="other_behavior",
                intensity=3,
                occurred_at=occurred_at,
                memo="B2B 기록",
                org_id=org_id,
            ),
            "Asia/Seoul",
            recorded_by=str(recorded_by),
        )

    saved_payload = create_log_mock.call_args.args[1]
    assert saved_payload["org_id"] == org_id
    assert saved_payload["recorded_by"] == recorded_by
    assert result.org_id == org_id
    assert result.recorded_by == recorded_by
