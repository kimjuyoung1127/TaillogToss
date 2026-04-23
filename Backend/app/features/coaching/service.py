"""
AI 코칭 서비스 — 6블록 생성 (AI + 규칙 폴백), 예산 게이팅, 피드백
FE api/coaching.ts 매핑: getCoachings, getLatestCoaching, submitFeedback
DogCoach coach/service.py + ai_recommendations/service.py 통합
Parity: AI-001
"""
import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.features.coaching import budget, prompts, rule_engine, schemas
from app.shared.clients.openai_client import OpenAIError, openai_client
from app.shared.models import AICoaching, BehaviorLog, Dog, DogEnv
from app.shared.utils.ownership import verify_dog_ownership

logger = logging.getLogger(__name__)


async def generate_coaching(
    db: AsyncSession, request: schemas.CoachingRequest,
) -> schemas.CoachingResponse:
    """6블록 코칭 생성 (캐시 → 예산 확인 → AI/규칙)"""
    dog_id = UUID(request.dog_id)

    # 1. Dog + DogEnv 조회
    dog_result = await db.execute(select(Dog).where(Dog.id == dog_id))
    dog = dog_result.scalar_one_or_none()
    if not dog:
        raise NotFoundException("Dog not found")

    env_result = await db.execute(select(DogEnv).where(DogEnv.dog_id == dog_id))
    env = env_result.scalar_one_or_none()

    # 2. 최근 로그 수집
    logs_q = (
        select(BehaviorLog)
        .where(BehaviorLog.dog_id == dog_id)
        .order_by(desc(BehaviorLog.occurred_at))
        .limit(50)
    )
    logs_result = (await db.execute(logs_q)).scalars().all()

    issues = _extract_list(env.chronic_issues if env else None, "top_issues")
    triggers = _extract_list(env.triggers if env else None, "ids")

    total_logs = len(logs_result)
    avg_intensity = (
        sum(l.intensity for l in logs_result if l.intensity) / total_logs
        if total_logs > 0 else 5.0
    )

    # 3. 예산 모드 확인
    budget_mode = await budget.get_budget_mode(db)

    # 4. 블록 생성
    blocks: schemas.CoachingBlocks
    ai_tokens_used = 0

    # 이전 코칭 요약 (연속성 제공)
    prev_summary = await _build_previous_coaching_summary(db, dog_id)

    if budget_mode == "rule_only" or not settings.OPENAI_API_KEY:
        # 규칙 기반 폴백
        blocks = rule_engine.generate_rule_based_blocks(
            dog.name, issues, triggers, total_logs, avg_intensity,
        )
        await budget.record_cost(db, 0, 0, 0, is_rule=True)
        analytics_metadata = {"log_count": total_logs, "analysis_days": 30, "top_behavior": None}
    else:
        # AI 생성 시도
        try:
            behavior_analytics_text, analytics_metadata = await _build_behavior_analytics_text(db, dog_id, logs_result)
            age_months = 0
            if dog.birth_date:
                age_months = int((date.today() - dog.birth_date).days / 30)

            user_prompt = prompts.build_user_prompt(
                dog.name, dog.breed or "믹스", age_months,
                issues, triggers, behavior_analytics_text, request.report_type,
                previous_coaching_summary=prev_summary,
            )
            result = await openai_client.generate(
                prompts.SYSTEM_PROMPT_6BLOCK, user_prompt,
                model=settings.AI_COACHING_MODEL,
            )

            parsed = _parse_ai_response(result["content"])
            blocks = schemas.CoachingBlocks(**parsed)
            blocks = _apply_safety_filter(blocks)  # 앱인토스 AI 심사 필수: 위험 콘텐츠 사후 필터
            ai_tokens_used = result["input_tokens"] + result["output_tokens"]

            await budget.record_cost(
                db, result["input_tokens"], result["output_tokens"], result["cost_usd"],
            )
        except (OpenAIError, json.JSONDecodeError, KeyError, ValueError) as e:
            logger.warning("AI coaching failed, falling back to rules: %s", e)
            blocks = rule_engine.generate_rule_based_blocks(
                dog.name, issues, triggers, total_logs, avg_intensity,
            )
            await budget.record_cost(db, 0, 0, 0, is_rule=True)
            analytics_metadata = {"log_count": total_logs, "analysis_days": 30, "top_behavior": None}

    # 5. DB 저장
    coaching = AICoaching(
        dog_id=dog_id,
        report_type=request.report_type,
        blocks=blocks.model_dump(),
        ai_tokens_used=ai_tokens_used,
    )
    db.add(coaching)
    await db.flush()

    # 6. 훈련 후보 품질 태깅 (비동기 — 실패해도 코칭 응답에 영향 없음)
    try:
        from app.features.coaching.training import tag_training_candidate
        await tag_training_candidate(db, coaching)
    except Exception as e:
        logger.warning("training candidate tagging failed: %s", e)

    await db.commit()
    await db.refresh(coaching)

    return schemas.CoachingResponse(
        id=coaching.id,
        dog_id=coaching.dog_id,
        report_type=coaching.report_type,
        blocks=blocks,
        feedback_score=coaching.feedback_score,
        ai_tokens_used=ai_tokens_used,
        created_at=coaching.created_at,
        analytics_metadata=analytics_metadata,
    )


async def get_coaching_list(
    db: AsyncSession, dog_id: UUID, limit: int = 10,
) -> List[schemas.CoachingResponse]:
    """코칭 목록 조회"""
    q = (
        select(AICoaching)
        .where(AICoaching.dog_id == dog_id)
        .order_by(desc(AICoaching.created_at))
        .limit(limit)
    )
    results = (await db.execute(q)).scalars().all()
    return [_to_response(c) for c in results]


async def get_latest_coaching(
    db: AsyncSession, dog_id: UUID,
) -> Optional[schemas.CoachingResponse]:
    """최신 코칭 결과 조회"""
    q = (
        select(AICoaching)
        .where(AICoaching.dog_id == dog_id)
        .order_by(desc(AICoaching.created_at))
        .limit(1)
    )
    result = (await db.execute(q)).scalars().first()
    if not result:
        return None
    return _to_response(result)


async def submit_feedback(
    db: AsyncSession, coaching_id: UUID, score: int, user_id: str,
) -> schemas.FeedbackResponse:
    """코칭 피드백 제출 (1-5점) — dog 소유권 검증 포함"""
    q = select(AICoaching).where(AICoaching.id == coaching_id)
    result = (await db.execute(q)).scalars().first()
    if not result:
        raise NotFoundException("Coaching not found")

    await verify_dog_ownership(db, result.dog_id, user_id=user_id)

    result.feedback_score = score
    await db.commit()

    return schemas.FeedbackResponse(coaching_id=coaching_id, feedback_score=score)


async def toggle_action_item(
    db: AsyncSession,
    coaching_id: UUID,
    action_item_id: str,
    is_completed: bool,
) -> schemas.ActionTrackerResponse:
    """액션 아이템 완료 토글 (upsert)"""
    from app.shared.models import ActionTracker

    q = select(ActionTracker).where(
        ActionTracker.coaching_id == coaching_id,
        ActionTracker.action_item_id == action_item_id,
    )
    result = (await db.execute(q)).scalars().first()

    now = datetime.now(timezone.utc)

    if result:
        result.is_completed = is_completed
        result.completed_at = now if is_completed else None
    else:
        result = ActionTracker(
            coaching_id=coaching_id,
            action_item_id=action_item_id,
            is_completed=is_completed,
            completed_at=now if is_completed else None,
        )
        db.add(result)

    await db.commit()
    await db.refresh(result)

    return schemas.ActionTrackerResponse(
        id=result.id,
        coaching_id=result.coaching_id,
        action_item_id=result.action_item_id,
        is_completed=result.is_completed,
        completed_at=result.completed_at,
    )


async def get_cost_status(db: AsyncSession) -> schemas.CostStatusResponse:
    """AI 비용 현황"""
    from app.shared.models import AICostUsageDaily, AICostUsageMonthly

    today = date.today()
    first_of_month = today.replace(day=1)

    daily_q = select(AICostUsageDaily).where(AICostUsageDaily.usage_date == today)
    daily = (await db.execute(daily_q)).scalar_one_or_none()

    monthly_q = select(AICostUsageMonthly).where(AICostUsageMonthly.usage_month == first_of_month)
    monthly = (await db.execute(monthly_q)).scalar_one_or_none()

    budget_mode = await budget.get_budget_mode(db)

    return schemas.CostStatusResponse(
        daily_calls=daily.total_calls if daily else 0,
        daily_cost_usd=float(daily.total_cost_usd) if daily else 0.0,
        daily_budget_usd=settings.AI_DAILY_BUDGET_USD,
        monthly_cost_usd=float(monthly.total_cost_usd) if monthly else 0.0,
        monthly_budget_usd=settings.AI_MONTHLY_BUDGET_USD,
        budget_mode=budget_mode,
    )


# 헬퍼 함수

def _to_response(coaching: AICoaching) -> schemas.CoachingResponse:
    blocks_data = coaching.blocks or {}
    return schemas.CoachingResponse(
        id=coaching.id,
        dog_id=coaching.dog_id,
        report_type=coaching.report_type,
        blocks=schemas.CoachingBlocks(**blocks_data) if blocks_data else schemas.CoachingBlocks(),
        feedback_score=coaching.feedback_score,
        ai_tokens_used=coaching.ai_tokens_used or 0,
        created_at=coaching.created_at,
        analytics_metadata=None,
    )


def _build_logs_summary(logs: list) -> str:
    """최근 로그를 텍스트 요약으로 변환"""
    lines = []
    for log in logs[:20]:
        dt = log.occurred_at.strftime("%Y-%m-%d") if log.occurred_at else "N/A"
        behavior = log.behavior or log.quick_category or "unknown"
        lines.append(f"- [{dt}] {behavior} (intensity: {log.intensity})")
    return "\n".join(lines) if lines else "No recent logs"


def _parse_ai_response(content: str) -> dict:
    """AI 응답에서 JSON 추출"""
    # 마크다운 코드 펜스 제거
    cleaned = content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(cleaned)


async def _build_previous_coaching_summary(db: AsyncSession, dog_id: UUID) -> str | None:
    """최근 2~3회 코칭의 trend, key_patterns를 요약 (AI 프롬프트 연속성)"""
    q = (
        select(AICoaching)
        .where(AICoaching.dog_id == dog_id)
        .order_by(desc(AICoaching.created_at))
        .limit(3)
    )
    results = (await db.execute(q)).scalars().all()
    if not results:
        return None

    lines = []
    for c in results:
        blocks = c.blocks or {}
        insight = blocks.get("insight", {})
        trend = insight.get("trend", "unknown")
        patterns = insight.get("key_patterns", [])
        dt = c.created_at.strftime("%Y-%m-%d") if c.created_at else "N/A"
        lines.append(f"- [{dt}] Trend: {trend}, Patterns: {', '.join(patterns[:3])}")

    return "\n".join(lines) if lines else None


def _extract_list(data, key: str) -> list:
    if not data:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get(key, [])
    return []


# 위험 키워드 — 인간 안전 (앱인토스 AI 서비스 심사 필수 요건)
_HUMAN_SAFETY_KEYWORDS: list[str] = [
    "자살", "자해", "자살방법", "자해방법", "죽는방법", "목숨",
    "마약", "약물남용", "코카인", "헤로인", "필로폰",
    "살인", "살해", "범죄방법", "폭발물",
    "혐오", "인종차별",
]

# 위험 키워드 — 반려견 학대
_DOG_ABUSE_KEYWORDS: list[str] = [
    "굶기", "굶겨", "굶어", "체벌", "때리", "발로차", "학대",
    "전기충격", "쇼크칼라", "목조르", "묶어두",
]

_SAFETY_RECOMMENDATION = "즉시 수의사 또는 전문 훈련사와 상담하세요. 이 내용은 AI가 생성한 제안이며 전문적인 조언을 대체하지 않습니다."
_SAFETY_SIGNAL = {
    "type": "SAFETY_FILTER_TRIGGERED",
    "description": "AI 안전 필터가 적용되었습니다. 전문가 상담을 권장합니다.",
    "severity": "high",
    "recommendation": _SAFETY_RECOMMENDATION,
}


def _contains_unsafe_content(text: str) -> tuple[bool, str]:
    """텍스트에서 위험 키워드 감지. (감지됨, 카테고리) 반환."""
    lower = text.replace(" ", "")
    for kw in _HUMAN_SAFETY_KEYWORDS:
        if kw in lower:
            return True, "human_safety"
    for kw in _DOG_ABUSE_KEYWORDS:
        if kw in lower:
            return True, "dog_abuse"
    return False, ""


def _apply_safety_filter(blocks: schemas.CoachingBlocks) -> schemas.CoachingBlocks:
    """AI 응답 사후 안전 필터 — 위험 콘텐츠 감지 시 risk_signals 강제 조정."""
    # 모든 텍스트 필드 수집해서 검사
    check_texts = [
        blocks.insight.summary if blocks.insight else "",
        blocks.dog_voice.message if blocks.dog_voice else "",
        " ".join(
            item.description for item in (blocks.action_plan.items if blocks.action_plan else [])
        ),
        " ".join(
            signal.description for signal in (
                blocks.risk_signals.signals if blocks.risk_signals else []
            )
        ),
    ]
    combined = " ".join(t for t in check_texts if t)

    flagged, category = _contains_unsafe_content(combined)
    if not flagged:
        return blocks

    logger.warning("Safety filter triggered (category=%s) — overriding risk_signals", category)

    # risk_signals를 critical로 강제 조정
    from app.features.coaching.schemas import RiskSignalsBlock, RiskSignal
    safe_signals = RiskSignalsBlock(
        signals=[RiskSignal(**_SAFETY_SIGNAL)],
        overall_risk="critical",
    )

    blocks_data = blocks.model_dump()
    blocks_data["risk_signals"] = safe_signals.model_dump()
    return schemas.CoachingBlocks(**blocks_data)


async def _build_behavior_analytics_text(
    db: AsyncSession, dog_id: UUID, logs: list
) -> tuple[str, dict]:
    """behavior_logs 기반 구조화된 분석 텍스트 생성 (프롬프트 주입용)"""
    if not logs:
        return "No recent behavior logs", {"log_count": 0, "analysis_days": 30, "top_behavior": None}

    # behavior 집계
    behavior_groups: dict[str, list] = {}
    hour_counts: dict[int, int] = {}

    from datetime import datetime, timedelta, timezone
    cutoff_30 = datetime.now(timezone.utc) - timedelta(days=30)

    for log in logs[:50]:  # 최대 50개
        key = log.behavior or log.quick_category or "unknown"
        behavior_groups.setdefault(key, []).append(log)
        if log.occurred_at:
            h = log.occurred_at.hour
            hour_counts[h] = hour_counts.get(h, 0) + 1

    total = len(logs)
    lines = [f"[행동 패턴 분석 (최근 30일)] 총 {total}회 기록"]

    top_behavior = None
    for behavior, blogs in sorted(behavior_groups.items(), key=lambda x: len(x[1]), reverse=True):
        intensities = [l.intensity for l in blogs if l.intensity is not None]
        avg_int = round(sum(intensities) / len(intensities), 1) if intensities else 0.0

        # peak hour for this behavior
        bh: dict[int, int] = {}
        for l in blogs:
            if l.occurred_at:
                bh[l.occurred_at.hour] = bh.get(l.occurred_at.hour, 0) + 1
        peak = max(bh, key=lambda h: bh[h]) if bh else None
        peak_str = f", {peak:02d}시 집중" if peak is not None else ""

        lines.append(f"- {behavior}: {len(blogs)}회, 평균 강도 {avg_int}/10{peak_str}")

        if top_behavior is None:
            top_behavior = behavior

    # weekly trend (이번주 vs 지난주)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    two_weeks_ago = datetime.now(timezone.utc) - timedelta(days=14)
    trend_lines = []

    def safe_dt(l):
        if l.occurred_at is None:
            return None
        if l.occurred_at.tzinfo is None:
            return l.occurred_at.replace(tzinfo=timezone.utc)
        return l.occurred_at

    for behavior, blogs in list(behavior_groups.items())[:3]:
        this_w = [
            l.intensity
            for l in blogs
            if safe_dt(l) and safe_dt(l) >= week_ago and l.intensity is not None
        ]
        last_w = [
            l.intensity
            for l in blogs
            if safe_dt(l) and two_weeks_ago <= safe_dt(l) < week_ago and l.intensity is not None
        ]

        if this_w and last_w:
            ta = sum(this_w) / len(this_w)
            la = sum(last_w) / len(last_w)
            delta = ta - la
            arrow = "▲ 악화" if delta >= 0.5 else ("▼ 개선" if delta <= -0.5 else "→ 유지")
            trend_lines.append(f"{behavior}: 지난주 {la:.1f} → 이번주 {ta:.1f} ({arrow})")

    if trend_lines:
        lines.append("[추이] " + ", ".join(trend_lines))

    # peak hour overall
    if hour_counts:
        peak_h = max(hour_counts, key=lambda h: hour_counts[h])
        lines.append(f"[피크 시간대] {peak_h:02d}시")

    analytics_text = "\n".join(lines)
    metadata = {
        "log_count": total,
        "analysis_days": 30,
        "top_behavior": top_behavior,
    }
    return analytics_text, metadata
