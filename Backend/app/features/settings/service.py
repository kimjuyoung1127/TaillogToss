"""
설정 서비스 — JIT 생성 + 부분 업데이트
FE api/settings.ts 매핑: getSettings, updateSettings
DogCoach settings/service.py 마이그레이션
Parity: APP-001
"""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException
from app.features.settings import repository, schemas


async def get_settings_with_defaults(
    db: AsyncSession, user_id: str,
) -> schemas.UserSettingsResponse:
    """설정 조회 (없으면 JIT 생성)"""
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    settings = await repository.get_user_settings(db, uuid_obj)
    if not settings:
        defaults = {
            "notification_pref": schemas.NotificationPrefSchema().model_dump(),
            "ai_persona": schemas.AiPersonaSchema().model_dump(),
        }
        settings = await repository.create_user_settings(db, uuid_obj, defaults)

    return schemas.UserSettingsResponse.model_validate(settings)


async def update_settings(
    db: AsyncSession, user_id: str, updates: schemas.UserSettingsUpdate,
) -> schemas.UserSettingsResponse:
    """설정 부분 업데이트 (JSONB 머지)"""
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    settings = await repository.get_user_settings(db, uuid_obj)
    if not settings:
        defaults = {
            "notification_pref": schemas.NotificationPrefSchema().model_dump(),
            "ai_persona": schemas.AiPersonaSchema().model_dump(),
        }
        settings = await repository.create_user_settings(db, uuid_obj, defaults)

    update_dict = {}
    if updates.notification_pref is not None:
        update_dict["notification_pref"] = updates.notification_pref.model_dump()
    if updates.ai_persona is not None:
        update_dict["ai_persona"] = updates.ai_persona.model_dump()
    if updates.marketing_agreed is not None:
        update_dict["marketing_agreed"] = updates.marketing_agreed
        if updates.marketing_agreed:
            update_dict["marketing_agreed_at"] = datetime.now(timezone.utc)

    settings = await repository.update_user_settings(db, settings, update_dict)
    return schemas.UserSettingsResponse.model_validate(settings)
