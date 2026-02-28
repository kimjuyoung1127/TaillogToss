"""
대시보드 서비스 — 프로필 + 통계 + 최근 로그 + 스트릭
DogCoach dashboard/service.py 마이그레이션
Parity: APP-001
"""
from datetime import timedelta
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.features.dashboard import schemas
from app.shared.models import BehaviorLog, Dog, DogEnv
from app.shared.utils.timezone import get_today_with_timezone


async def get_dashboard_data(
    db: AsyncSession, dog_id: str, timezone_str: str = "Asia/Seoul",
) -> schemas.DashboardResponse:
    # 1. Dog 정보
    result = await db.execute(select(Dog).where(Dog.id == dog_id))
    dog = result.scalar_one_or_none()
    if not dog:
        raise NotFoundException("Dog not found")

    # 나이 계산
    age_months = 0
    if dog.birth_date:
        today = get_today_with_timezone(timezone_str)
        age_months = int((today - dog.birth_date).days / 30)

    dog_profile = schemas.DashboardDogProfile(
        id=dog.id,
        name=dog.name,
        breed=dog.breed,
        age_months=age_months,
        weight_kg=float(dog.weight_kg) if dog.weight_kg else None,
        profile_image_url=dog.profile_image_url,
    )

    # 1.5 DogEnv → issues, triggers
    env_result = await db.execute(select(DogEnv).where(DogEnv.dog_id == dog_id))
    dog_env = env_result.scalar_one_or_none()

    issues = _extract_list(dog_env.chronic_issues if dog_env else None, "top_issues")
    env_triggers = _extract_list(dog_env.triggers if dog_env else None, "ids")

    # 2. 통계
    count_q = select(func.count()).where(BehaviorLog.dog_id == dog_id)
    total_logs = (await db.execute(count_q)).scalar() or 0

    last_log_q = (
        select(BehaviorLog.occurred_at)
        .where(BehaviorLog.dog_id == dog_id)
        .order_by(desc(BehaviorLog.occurred_at))
        .limit(1)
    )
    last_logged_at = (await db.execute(last_log_q)).scalar_one_or_none()

    # 스트릭 계산
    current_streak = 0
    if last_logged_at:
        user_today = get_today_with_timezone(timezone_str)
        tz = ZoneInfo(timezone_str)
        recent_q = (
            select(BehaviorLog.occurred_at)
            .where(BehaviorLog.dog_id == dog_id)
            .order_by(desc(BehaviorLog.occurred_at))
            .limit(500)
        )
        raw_result = await db.execute(recent_q)
        raw_dates = [row[0] for row in raw_result.all()]
        log_dates = sorted(
            {dt.astimezone(tz).date() for dt in raw_dates},
            reverse=True,
        )
        if log_dates:
            expected = user_today
            if log_dates[0] == user_today - timedelta(days=1):
                expected = user_today - timedelta(days=1)
            for d in log_dates:
                if d == expected:
                    current_streak += 1
                    expected -= timedelta(days=1)
                elif d < expected:
                    break

    stats = schemas.QuickLogStats(
        total_logs=total_logs,
        current_streak=current_streak,
        last_logged_at=last_logged_at,
    )

    # 3. 최근 로그
    logs_q = (
        select(BehaviorLog)
        .where(BehaviorLog.dog_id == dog_id)
        .order_by(desc(BehaviorLog.occurred_at))
        .limit(5)
    )
    recent_result = (await db.execute(logs_q)).scalars().all()
    recent_logs = [schemas.RecentLogItem.model_validate(log) for log in recent_result]

    return schemas.DashboardResponse(
        dog_profile=dog_profile,
        stats=stats,
        recent_logs=recent_logs,
        issues=issues,
        env_triggers=env_triggers,
        env_info=dog_env.household_info if dog_env else None,
        health_meta=dog_env.health_meta if dog_env else None,
        profile_meta=dog_env.profile_meta if dog_env else None,
    )


def _extract_list(data, key: str) -> list:
    """JSONB 데이터에서 리스트 추출 (신/구 형식 호환)"""
    if not data:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get(key, [])
    return []
