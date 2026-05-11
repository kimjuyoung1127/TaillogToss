"""
행동 분석 서비스 테스트 — 5케이스
Parity: AI-COACHING-ANALYTICS-001
"""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.features.analytics.service import get_behavior_analytics
from app.shared.models import BehaviorLog


def _make_log(
    dog_id,
    behavior: str,
    intensity: int,
    hours_ago: int = 1,
    day_offset: int = 0,
    memo: str | None = None,
) -> MagicMock:
    log = MagicMock(spec=BehaviorLog)
    log.dog_id = dog_id
    log.behavior = behavior
    log.quick_category = behavior
    log.intensity = intensity
    log.memo = memo
    log.occurred_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago, days=day_offset)
    return log


@pytest.fixture
def dog_id():
    return uuid4()


@pytest.fixture
def mock_db():
    session = AsyncMock()
    return session


def _patch_db(mock_db, logs):
    now = datetime.now(timezone.utc)
    week_cutoff = now - timedelta(days=7)
    prev_week_cutoff = now - timedelta(days=14)
    groups = {}
    for log in logs:
        behavior = log.behavior or log.quick_category or "unknown"
        groups.setdefault(behavior, []).append(log)

    aggregate_rows = []
    sorted_groups = sorted(groups.items(), key=lambda item: len(item[1]), reverse=True)
    for behavior, behavior_logs in sorted_groups:
        intensities = [log.intensity for log in behavior_logs if log.intensity is not None]
        this_week = [
            log.intensity
            for log in behavior_logs
            if log.occurred_at and log.occurred_at >= week_cutoff and log.intensity is not None
        ]
        last_week = [
            log.intensity
            for log in behavior_logs
            if log.occurred_at
            and prev_week_cutoff <= log.occurred_at < week_cutoff
            and log.intensity is not None
        ]
        aggregate_rows.append(
            SimpleNamespace(
                behavior=behavior,
                count=len(behavior_logs),
                avg_intensity=(sum(intensities) / len(intensities)) if intensities else None,
                this_week_avg=(sum(this_week) / len(this_week)) if this_week else None,
                last_week_avg=(sum(last_week) / len(last_week)) if last_week else None,
            )
        )

    hour_counts = {}
    for log in logs:
        if log.occurred_at:
            hour_counts[log.occurred_at.hour] = hour_counts.get(log.occurred_at.hour, 0) + 1
    peak_hour = None
    if hour_counts:
        peak_hour = sorted(hour_counts.items(), key=lambda item: (-item[1], item[0]))[0][0]

    memo_rows = [
        SimpleNamespace(behavior=log.behavior or log.quick_category or "unknown", memo=log.memo)
        for log in logs
        if log.memo
    ]

    aggregate_result = MagicMock()
    aggregate_result.all.return_value = aggregate_rows
    peak_result = MagicMock()
    peak_result.first.return_value = (
        SimpleNamespace(hour=peak_hour, count=hour_counts.get(peak_hour, 0))
        if peak_hour is not None
        else None
    )
    memo_result = MagicMock()
    memo_result.all.return_value = memo_rows

    mock_db.execute = AsyncMock(side_effect=[aggregate_result, peak_result, memo_result])
    return mock_db


# ── 케이스 1: 로그 없음 → graceful empty 반환 ─────────────────────────────
@pytest.mark.asyncio
async def test_empty_logs_graceful(mock_db, dog_id):
    _patch_db(mock_db, [])
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.total_logs == 0
    assert result.top_behaviors == []
    assert result.avg_intensity_by_behavior == {}
    assert result.weekly_trend == {}
    assert result.peak_hour is None
    assert result.stats == []


# ── 케이스 2: 주간 추이 — improving (강도 감소) ───────────────────────────
@pytest.mark.asyncio
async def test_weekly_trend_improving(mock_db, dog_id):
    # 지난주: intensity=8, 이번주: intensity=5
    logs = [
        _make_log(dog_id, "barking", 8, day_offset=10),
        _make_log(dog_id, "barking", 8, day_offset=9),
        _make_log(dog_id, "barking", 5, day_offset=1),
        _make_log(dog_id, "barking", 5, day_offset=0),
    ]
    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.weekly_trend.get("barking") == "improving"


# ── 케이스 3: 주간 추이 — worsening (강도 증가) ──────────────────────────
@pytest.mark.asyncio
async def test_weekly_trend_worsening(mock_db, dog_id):
    logs = [
        _make_log(dog_id, "anxiety", 3, day_offset=10),
        _make_log(dog_id, "anxiety", 3, day_offset=9),
        _make_log(dog_id, "anxiety", 8, day_offset=1),
        _make_log(dog_id, "anxiety", 9, day_offset=0),
    ]
    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.weekly_trend.get("anxiety") == "worsening"


# ── 케이스 4: 피크 시간대 감지 ───────────────────────────────────────────
@pytest.mark.asyncio
async def test_hourly_peak_detection(mock_db, dog_id):
    now = datetime.now(timezone.utc)
    # 19시에 로그 3개, 10시에 1개 → peak_hour = 19
    logs = []
    for _ in range(3):
        log = MagicMock(spec=BehaviorLog)
        log.dog_id = dog_id
        log.behavior = "barking"
        log.quick_category = "barking"
        log.intensity = 6
        log.occurred_at = now.replace(hour=19, minute=0, second=0, microsecond=0)
        logs.append(log)
    log_10 = MagicMock(spec=BehaviorLog)
    log_10.dog_id = dog_id
    log_10.behavior = "barking"
    log_10.quick_category = "barking"
    log_10.intensity = 5
    log_10.occurred_at = now.replace(hour=10, minute=0, second=0, microsecond=0)
    logs.append(log_10)

    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.peak_hour == 19


# ── 케이스 5: 복수 행동 — top_behaviors 빈도순 정렬 ──────────────────────
@pytest.mark.asyncio
async def test_top_behaviors_sorted_by_frequency(mock_db, dog_id):
    logs = (
        [_make_log(dog_id, "barking", 7) for _ in range(5)]
        + [_make_log(dog_id, "jumping", 4) for _ in range(3)]
        + [_make_log(dog_id, "anxiety", 9) for _ in range(1)]
    )
    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.top_behaviors[0] == "barking"
    assert result.top_behaviors[1] == "jumping"
    assert result.top_behaviors[2] == "anxiety"
    assert result.total_logs == 9
    assert result.avg_intensity_by_behavior["barking"] == 7.0


# ── 케이스 6: 메모 있는 로그 → memo_keywords 추출 ─────────────────────────
@pytest.mark.asyncio
async def test_memo_keywords_extracted(mock_db, dog_id):
    logs = [
        _make_log(dog_id, "barking", 7, memo="산책 중 자전거 지나갈 때 짖음"),
        _make_log(dog_id, "barking", 6, memo="초인종 울릴 때 짖음"),
        _make_log(dog_id, "barking", 8, memo="자전거 소리에 반응"),
    ]
    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.memo_keywords is not None
    keywords = result.memo_keywords.get("barking", [])
    assert len(keywords) > 0
    # 자전거가 2번 등장 → 상위에 포함
    assert "자전거" in keywords


# ── 케이스 7: 메모 없는 로그 → memo_keywords 빈 dict (None 아님) ──────────
@pytest.mark.asyncio
async def test_no_memo_graceful(mock_db, dog_id):
    logs = [_make_log(dog_id, "barking", 5) for _ in range(3)]
    _patch_db(mock_db, logs)
    result = await get_behavior_analytics(mock_db, dog_id)

    assert result.memo_keywords is not None
    assert isinstance(result.memo_keywords, dict)
    assert result.memo_keywords == {}


# ── 케이스 8: ORM 전체 로그 조회 대신 집계 쿼리 사용 ─────────────────────
@pytest.mark.asyncio
async def test_uses_aggregate_queries_instead_of_full_log_scan(mock_db, dog_id):
    logs = [_make_log(dog_id, "barking", 7, memo="자전거 소리") for _ in range(2)]
    _patch_db(mock_db, logs)

    await get_behavior_analytics(mock_db, dog_id)

    assert mock_db.execute.await_count == 3
