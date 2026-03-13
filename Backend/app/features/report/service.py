"""
B2B 리포트 서비스 — 리포트 생성/조회/발송/인터랙션
FE api/report.ts 매핑: getOrgReports, getDogReports, getReport, getReportByShareToken,
  generateReport, sendReport, updateReport, createInteraction, getReportInteractions
Parity: B2B-001
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.features.report import schemas
from app.shared.models import DailyReport, ParentInteraction


# ──────────────────────────────────────
# 리포트 조회
# ──────────────────────────────────────

async def get_org_reports(
    db: AsyncSession, org_id: UUID, report_date: Optional[str] = None,
) -> List[schemas.DailyReportResponse]:
    """리포트 목록 (조직 기준, 날짜 필터)"""
    stmt = (
        select(DailyReport)
        .where(DailyReport.created_by_org_id == org_id)
        .order_by(desc(DailyReport.report_date))
    )
    if report_date:
        from datetime import date as dt_date
        stmt = stmt.where(DailyReport.report_date == dt_date.fromisoformat(report_date))
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return [_to_report_response(r) for r in reports]


async def get_dog_reports(
    db: AsyncSession, dog_id: UUID,
) -> List[schemas.DailyReportResponse]:
    """리포트 목록 (강아지 기준)"""
    stmt = (
        select(DailyReport)
        .where(DailyReport.dog_id == dog_id)
        .order_by(desc(DailyReport.report_date))
    )
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return [_to_report_response(r) for r in reports]


async def get_report(
    db: AsyncSession, report_id: UUID,
) -> schemas.DailyReportResponse:
    """리포트 상세 조회"""
    stmt = select(DailyReport).where(DailyReport.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise NotFoundException("Report not found")
    return _to_report_response(report)


async def get_report_by_share_token(
    db: AsyncSession, token: str,
) -> schemas.DailyReportResponse:
    """공유 토큰으로 리포트 조회 (비인증 보호자)"""
    stmt = select(DailyReport).where(DailyReport.share_token == token)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise NotFoundException("Report not found or link expired")
    return _to_report_response(report)


# ──────────────────────────────────────
# 리포트 생성/수정/발송
# ──────────────────────────────────────

async def generate_report(
    db: AsyncSession, data: schemas.GenerateReportRequest,
) -> schemas.DailyReportResponse:
    """리포트 생성 (generation_status=pending으로 생성, AI 생성은 별도 워커)"""
    from datetime import date as dt_date
    report = DailyReport(
        dog_id=UUID(data.dog_id),
        report_date=dt_date.fromisoformat(data.report_date),
        template_type=data.template_type,
        created_by_org_id=UUID(data.created_by_org_id) if data.created_by_org_id else None,
        created_by_trainer_id=UUID(data.created_by_trainer_id) if data.created_by_trainer_id else None,
        generation_status="pending",
        highlight_photo_urls=[],
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return _to_report_response(report)


async def send_report(
    db: AsyncSession, report_id: UUID,
) -> schemas.DailyReportResponse:
    """리포트 발송 (share_token 생성 + sent_at 업데이트)"""
    stmt = select(DailyReport).where(DailyReport.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise NotFoundException("Report not found")

    report.share_token = str(uuid4())
    report.generation_status = "sent"
    report.sent_at = datetime.now(timezone.utc)
    report.expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    await db.commit()
    await db.refresh(report)
    return _to_report_response(report)


async def update_report(
    db: AsyncSession, report_id: UUID, updates: schemas.UpdateReportRequest,
) -> schemas.DailyReportResponse:
    """리포트 편집"""
    stmt = select(DailyReport).where(DailyReport.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise NotFoundException("Report not found")

    if updates.behavior_summary is not None:
        report.behavior_summary = updates.behavior_summary
    if updates.condition_notes is not None:
        report.condition_notes = updates.condition_notes
    if updates.ai_coaching_oneliner is not None:
        report.ai_coaching_oneliner = updates.ai_coaching_oneliner

    await db.commit()
    await db.refresh(report)
    return _to_report_response(report)


# ──────────────────────────────────────
# 보호자 인터랙션
# ──────────────────────────────────────

async def create_interaction(
    db: AsyncSession, data: schemas.CreateInteractionRequest,
) -> schemas.ParentInteractionResponse:
    """보호자 인터랙션 생성"""
    interaction = ParentInteraction(
        report_id=UUID(data.report_id),
        parent_user_id=UUID(data.parent_user_id) if data.parent_user_id else None,
        parent_identifier=data.parent_identifier,
        interaction_type=data.interaction_type,
        content=data.content,
    )
    db.add(interaction)
    await db.commit()
    await db.refresh(interaction)
    return schemas.ParentInteractionResponse.model_validate(interaction)


async def get_report_interactions(
    db: AsyncSession, report_id: UUID,
) -> List[schemas.ParentInteractionResponse]:
    """리포트 인터랙션 목록"""
    stmt = (
        select(ParentInteraction)
        .where(ParentInteraction.report_id == report_id)
        .order_by(ParentInteraction.created_at)
    )
    result = await db.execute(stmt)
    interactions = result.scalars().all()
    return [schemas.ParentInteractionResponse.model_validate(i) for i in interactions]


# ──────────────────────────────────────
# 헬퍼
# ──────────────────────────────────────

def _to_report_response(report: DailyReport) -> schemas.DailyReportResponse:
    """DailyReport ORM → Response DTO (report_date 문자열 변환)"""
    return schemas.DailyReportResponse(
        id=report.id,
        dog_id=report.dog_id,
        report_date=str(report.report_date),
        template_type=str(report.template_type.value) if hasattr(report.template_type, "value") else str(report.template_type),
        created_by_org_id=report.created_by_org_id,
        created_by_trainer_id=report.created_by_trainer_id,
        behavior_summary=report.behavior_summary,
        condition_notes=report.condition_notes,
        ai_coaching_oneliner=report.ai_coaching_oneliner,
        seven_day_comparison=report.seven_day_comparison,
        highlight_photo_urls=report.highlight_photo_urls or [],
        generation_status=str(report.generation_status.value) if hasattr(report.generation_status, "value") else str(report.generation_status),
        ai_model=report.ai_model,
        ai_cost_usd=float(report.ai_cost_usd) if report.ai_cost_usd else None,
        generated_at=report.generated_at,
        scheduled_send_at=report.scheduled_send_at,
        sent_at=report.sent_at,
        share_token=report.share_token,
        toss_share_url=report.toss_share_url,
        expires_at=report.expires_at,
        created_at=report.created_at,
    )
