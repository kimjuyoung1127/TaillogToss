"""
타임존 유틸 — UTC 변환 + 사용자 로컬 날짜
DogCoach timezone.py 마이그레이션
"""
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo


def to_utc(dt: datetime, timezone_str: str = "Asia/Seoul") -> datetime:
    """naive/aware datetime → UTC aware datetime 변환"""
    if dt.tzinfo is None:
        local_tz = ZoneInfo(timezone_str)
        dt = dt.replace(tzinfo=local_tz)
    return dt.astimezone(timezone.utc)


def get_today_with_timezone(timezone_str: str = "Asia/Seoul") -> date:
    """사용자 타임존 기준 오늘 날짜 (스트릭, 일일 미션용)"""
    return datetime.now(ZoneInfo(timezone_str)).date()
