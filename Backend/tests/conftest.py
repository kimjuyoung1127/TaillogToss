"""
pytest 공통 픽스처 — 비동기 테스트 + mock DB + FastAPI 테스트 클라이언트
"""
import asyncio
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# 테스트 환경변수 설정 (app import 전에 실행 필수)
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")

from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def event_loop():
    """세션 스코프 이벤트 루프"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db():
    """AsyncSession mock"""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.flush = AsyncMock()
    session.add = MagicMock()
    session.delete = AsyncMock()
    return session


@pytest.fixture
def mock_user_id():
    """테스트 사용자 UUID 문자열"""
    return "11111111-1111-1111-1111-111111111111"


@pytest.fixture
def mock_dog_id():
    """테스트 강아지 UUID 문자열"""
    return "22222222-2222-2222-2222-222222222222"


@pytest.fixture
def mock_org_id():
    """테스트 조직 UUID 문자열"""
    return "33333333-3333-3333-3333-333333333333"


@pytest.fixture
def client():
    """FastAPI 테스트 클라이언트 (DB/auth mock)"""
    from app.core.database import get_db
    from app.core.security import get_current_user_id
    from app.main import app

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.add = MagicMock()

    async def override_db():
        yield mock_session

    async def override_user():
        return "11111111-1111-1111-1111-111111111111"

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user_id] = override_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
