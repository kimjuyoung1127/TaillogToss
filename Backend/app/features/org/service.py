"""
B2B 조직 서비스 — 조직/멤버/강아지/배정 CRUD + today 상태 집계
FE api/org.ts 매핑: getOrg, getOrgMembers, getOrgDogs, enrollDog, dischargeDog,
  inviteMember, assignDog, getOrgAssignments, getMyAssignments, getOrgTodayStats, updateOrg
Parity: B2B-001
"""
from datetime import date, datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.features.org import schemas
from app.shared.models import (
    BehaviorLog,
    DailyReport,
    Dog,
    DogAssignment,
    OrgAnalyticsDaily,
    OrgDog,
    OrgDogPii,
    OrgMember,
    Organization,
)


# ──────────────────────────────────────
# 조직 멤버십 검증 유틸
# ──────────────────────────────────────

async def verify_org_membership(
    db: AsyncSession, org_id: UUID, user_id: str,
) -> OrgMember:
    """조직 멤버 확인 (active/pending). 없으면 ForbiddenException."""
    stmt = (
        select(OrgMember)
        .where(
            OrgMember.org_id == org_id,
            OrgMember.user_id == UUID(user_id),
            OrgMember.status.in_(["active", "pending"]),
        )
    )
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    if not member:
        raise ForbiddenException("Not a member of this organization")
    return member


# ──────────────────────────────────────
# 조직 조회/수정
# ──────────────────────────────────────

async def get_org(db: AsyncSession, org_id: UUID) -> schemas.OrgResponse:
    """조직 상세 조회"""
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalar_one_or_none()
    if not org:
        raise NotFoundException("Organization not found")
    return schemas.OrgResponse.model_validate(org)


async def update_org(
    db: AsyncSession, user_id: str, org_id: UUID, updates: schemas.UpdateOrgRequest,
) -> schemas.OrgResponse:
    """조직 설정 업데이트 (owner/manager만)"""
    member = await verify_org_membership(db, org_id, user_id)
    if member.role.value not in ("owner", "manager"):
        raise ForbiddenException("Only owner or manager can update organization")

    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalar_one_or_none()
    if not org:
        raise NotFoundException("Organization not found")

    if updates.name is not None:
        org.name = updates.name
    if updates.phone is not None:
        org.phone = updates.phone
    if updates.address is not None:
        org.address = updates.address
    if updates.settings is not None:
        org.settings = updates.settings
    org.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(org)
    return schemas.OrgResponse.model_validate(org)


# ──────────────────────────────────────
# 멤버
# ──────────────────────────────────────

async def get_org_members(
    db: AsyncSession, org_id: UUID,
) -> List[schemas.OrgMemberResponse]:
    """조직 멤버 목록"""
    stmt = (
        select(OrgMember)
        .where(OrgMember.org_id == org_id)
        .order_by(OrgMember.invited_at)
    )
    result = await db.execute(stmt)
    members = result.scalars().all()
    return [schemas.OrgMemberResponse.model_validate(m) for m in members]


async def get_active_org_member_count(db: AsyncSession, org_id: UUID) -> int:
    """활성 멤버 수 (active + pending)"""
    stmt = (
        select(func.count(OrgMember.id))
        .where(
            OrgMember.org_id == org_id,
            OrgMember.status.in_(["active", "pending"]),
        )
    )
    result = await db.execute(stmt)
    return result.scalar() or 0


async def invite_member(
    db: AsyncSession, user_id: str, data: schemas.InviteMemberRequest,
) -> schemas.OrgMemberResponse:
    """멤버 초대"""
    org_id = UUID(data.org_id)
    await verify_org_membership(db, org_id, user_id)

    member = OrgMember(
        org_id=org_id,
        user_id=UUID(data.user_id),
        role=data.role,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return schemas.OrgMemberResponse.model_validate(member)


# ──────────────────────────────────────
# 강아지 등록/퇴소
# ──────────────────────────────────────

async def get_org_dogs_with_status(
    db: AsyncSession, org_id: UUID,
) -> List[schemas.OrgDogWithStatus]:
    """조직 소속 강아지 + 오늘 상태 (FE getOrgDogs JOIN 미러)"""
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time(), tzinfo=timezone.utc)

    # 1) org_dogs (active)
    stmt = (
        select(OrgDog)
        .where(OrgDog.org_id == org_id, OrgDog.status == "active")
        .order_by(OrgDog.enrolled_at)
    )
    result = await db.execute(stmt)
    org_dogs = result.scalars().all()
    if not org_dogs:
        return []

    dog_ids = [od.dog_id for od in org_dogs]

    # 2) dogs JOIN (이름, 품종)
    dog_stmt = select(Dog).where(Dog.id.in_(dog_ids))
    dog_result = await db.execute(dog_stmt)
    dogs_map = {d.id: d for d in dog_result.scalars().all()}

    # 3) 오늘 기록 집계
    log_stmt = (
        select(
            BehaviorLog.dog_id,
            func.count(BehaviorLog.id).label("cnt"),
            func.max(BehaviorLog.occurred_at).label("last_time"),
        )
        .where(
            BehaviorLog.org_id == org_id,
            BehaviorLog.dog_id.in_(dog_ids),
            BehaviorLog.occurred_at >= today_start,
            BehaviorLog.occurred_at <= today_end,
        )
        .group_by(BehaviorLog.dog_id)
    )
    log_result = await db.execute(log_stmt)
    log_map = {
        row.dog_id: {"count": row.cnt, "last_time": str(row.last_time) if row.last_time else None}
        for row in log_result
    }

    # 4) 오늘 리포트 여부
    report_stmt = (
        select(DailyReport.dog_id)
        .where(
            DailyReport.created_by_org_id == org_id,
            DailyReport.report_date == today,
            DailyReport.dog_id.in_(dog_ids),
        )
    )
    report_result = await db.execute(report_stmt)
    reported_ids = {row[0] for row in report_result}

    # 5) 담당자 배정
    assign_stmt = (
        select(DogAssignment.dog_id, DogAssignment.trainer_user_id)
        .where(
            DogAssignment.org_id == org_id,
            DogAssignment.status == "active",
            DogAssignment.dog_id.in_(dog_ids),
        )
    )
    assign_result = await db.execute(assign_stmt)
    trainer_map = {row.dog_id: str(row.trainer_user_id) for row in assign_result}

    # 6) 병합
    items = []
    for od in org_dogs:
        dog_info = dogs_map.get(od.dog_id)
        log_info = log_map.get(od.dog_id, {"count": 0, "last_time": None})
        items.append(schemas.OrgDogWithStatus(
            id=od.id,
            org_id=od.org_id,
            dog_id=od.dog_id,
            parent_user_id=od.parent_user_id,
            parent_name=od.parent_name,
            group_tag=od.group_tag or "default",
            enrolled_at=od.enrolled_at,
            discharged_at=od.discharged_at,
            status=str(od.status.value) if hasattr(od.status, "value") else str(od.status),
            dog_name=dog_info.name if dog_info else None,
            dog_breed=dog_info.breed if dog_info else None,
            today_log_count=log_info["count"],
            has_today_report=od.dog_id in reported_ids,
            last_log_time=log_info["last_time"],
            trainer_name=trainer_map.get(od.dog_id),
        ))
    return items


async def get_active_org_dog_count(db: AsyncSession, org_id: UUID) -> int:
    """활성 강아지 수"""
    stmt = (
        select(func.count(OrgDog.id))
        .where(OrgDog.org_id == org_id, OrgDog.status == "active")
    )
    result = await db.execute(stmt)
    return result.scalar() or 0


async def enroll_dog(
    db: AsyncSession, user_id: str, data: schemas.EnrollDogRequest,
) -> schemas.OrgDogResponse:
    """강아지 등록 (센터에 입소) + PII 별도 저장"""
    org_id = UUID(data.org_id)
    await verify_org_membership(db, org_id, user_id)

    org_dog = OrgDog(
        org_id=org_id,
        dog_id=UUID(data.dog_id),
        parent_user_id=UUID(data.parent_user_id) if data.parent_user_id else None,
        parent_name=data.parent_name,
        group_tag=data.group_tag,
    )
    db.add(org_dog)
    await db.flush()

    # PII 별도 테이블 (암호화된 상태로 수신)
    if data.parent_phone_enc or data.parent_email_enc:
        pii = OrgDogPii(
            org_dog_id=org_dog.id,
            parent_phone_enc=data.parent_phone_enc.encode() if data.parent_phone_enc else None,
            parent_email_enc=data.parent_email_enc.encode() if data.parent_email_enc else None,
            encryption_key_version=1,
        )
        db.add(pii)

    await db.commit()
    await db.refresh(org_dog)
    return schemas.OrgDogResponse.model_validate(org_dog)


async def discharge_dog(
    db: AsyncSession, user_id: str, org_dog_id: UUID,
) -> None:
    """강아지 퇴소"""
    stmt = select(OrgDog).where(OrgDog.id == org_dog_id)
    result = await db.execute(stmt)
    org_dog = result.scalar_one_or_none()
    if not org_dog:
        raise NotFoundException("OrgDog not found")

    await verify_org_membership(db, org_dog.org_id, user_id)

    org_dog.status = "discharged"
    org_dog.discharged_at = datetime.now(timezone.utc)
    await db.commit()


# ──────────────────────────────────────
# 담당자 배정
# ──────────────────────────────────────

async def assign_dog(
    db: AsyncSession, user_id: str, data: schemas.AssignDogRequest,
) -> schemas.DogAssignmentResponse:
    """담당자 배정"""
    org_id = UUID(data.org_id) if data.org_id else None
    if org_id:
        await verify_org_membership(db, org_id, user_id)

    assignment = DogAssignment(
        dog_id=UUID(data.dog_id),
        org_id=org_id,
        trainer_user_id=UUID(data.trainer_user_id),
        role=data.role,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return schemas.DogAssignmentResponse.model_validate(assignment)


async def get_org_assignments(
    db: AsyncSession, org_id: UUID,
) -> List[schemas.DogAssignmentResponse]:
    """담당자 배정 목록 (조직 기준)"""
    stmt = (
        select(DogAssignment)
        .where(DogAssignment.org_id == org_id, DogAssignment.status == "active")
    )
    result = await db.execute(stmt)
    assignments = result.scalars().all()
    return [schemas.DogAssignmentResponse.model_validate(a) for a in assignments]


async def get_my_assignments(
    db: AsyncSession, trainer_id: str,
) -> List[schemas.DogAssignmentResponse]:
    """내 담당 강아지 목록 (훈련사 기준)"""
    stmt = (
        select(DogAssignment)
        .where(
            DogAssignment.trainer_user_id == UUID(trainer_id),
            DogAssignment.status == "active",
        )
    )
    result = await db.execute(stmt)
    assignments = result.scalars().all()
    return [schemas.DogAssignmentResponse.model_validate(a) for a in assignments]


# ──────────────────────────────────────
# 통계
# ──────────────────────────────────────

async def get_org_today_stats(
    db: AsyncSession, org_id: UUID,
) -> Optional[schemas.OrgAnalyticsDailyResponse]:
    """조직 오늘 통계 조회"""
    today = date.today()
    stmt = (
        select(OrgAnalyticsDaily)
        .where(
            OrgAnalyticsDaily.org_id == org_id,
            OrgAnalyticsDaily.analytics_date == today,
        )
        .limit(1)
    )
    result = await db.execute(stmt)
    stats = result.scalar_one_or_none()
    if not stats:
        return None
    return schemas.OrgAnalyticsDailyResponse.model_validate(stats)
