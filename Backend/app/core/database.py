"""
비동기 데이터베이스 엔진 + 세션 팩토리 — Supabase pgbouncer 호환
DogCoach database.py 마이그레이션
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Supabase pooler(6543/pgbouncer transaction mode)는
# asyncpg prepared statement 캐시와 호환되지 않음
is_supabase_pooler = "pooler.supabase.com" in settings.DATABASE_URL

engine_kwargs: dict = {
    "echo": False,
    "future": True,
    "pool_pre_ping": True,
}

if is_supabase_pooler:
    engine_kwargs.update({
        "poolclass": NullPool,
        "connect_args": {"statement_cache_size": 0},
    })
else:
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
    })

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    """FastAPI Depends용 비동기 DB 세션 제너레이터"""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
