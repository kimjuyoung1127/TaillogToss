"""
리포트 서비스 검증 테스트 — 보호자 공유 인증
"""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.features.report.service import verify_parent_phone_last4


def _mock_scalar_result(value):
    result = MagicMock()
    result.scalar_one_or_none.return_value = value
    return result


@pytest.mark.asyncio
async def test_verify_parent_phone_last4_returns_true_when_matched():
    db = AsyncMock()
    db.execute.return_value = _mock_scalar_result("1234")

    result = await verify_parent_phone_last4(db, "share-token", "1234")

    assert result.verified is True


@pytest.mark.asyncio
async def test_verify_parent_phone_last4_returns_false_when_mismatched():
    db = AsyncMock()
    db.execute.return_value = _mock_scalar_result("1234")

    result = await verify_parent_phone_last4(db, "share-token", "9999")

    assert result.verified is False


@pytest.mark.asyncio
async def test_verify_parent_phone_last4_rejects_invalid_last4_without_query():
    db = AsyncMock()

    result = await verify_parent_phone_last4(db, "share-token", "12")

    assert result.verified is False
    db.execute.assert_not_called()
