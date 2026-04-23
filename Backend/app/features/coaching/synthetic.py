"""
합성 훈련 데이터 생성 모듈.
실 유저 없이도 매일 카테고리별 코칭을 생성해 훈련 데이터 축적.
Parity: AI-TRAIN-001
"""
import json
import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.features.coaching import prompts
from app.shared.clients.openai_client import OpenAIError, openai_client
from app.shared.models import AICoaching, CoachingSyntheticLog, ReportType

logger = logging.getLogger(__name__)

# 7개 카테고리 순환 (플랜 기준)
CATEGORIES = [
    "barking",            # Day 0
    "aggression",         # Day 1
    "separation_anxiety", # Day 2
    "destructive",        # Day 3
    "fear",               # Day 4
    "hyperactivity",      # Day 5
    "marking",            # Day 6
]


def get_today_category() -> str:
    """날짜 toordinal 기반 순환 카테고리 반환"""
    return CATEGORIES[date.today().toordinal() % len(CATEGORIES)]


# 카테고리별 합성 프로필 3종 (소형/중형/대형견, 다양한 나이)
SYNTHETIC_PROFILES: dict[str, list[dict]] = {
    "barking": [
        {"name": "코코", "breed": "말티즈", "age_months": 18,
         "issues": ["barking"], "triggers": ["초인종", "배달", "현관 노크"],
         "avg_intensity": 7.5, "log_count": 12},
        {"name": "루나", "breed": "비글", "age_months": 36,
         "issues": ["barking"], "triggers": ["다른 개", "자동차"],
         "avg_intensity": 6.0, "log_count": 8},
        {"name": "맥스", "breed": "진돗개", "age_months": 60,
         "issues": ["barking", "territory"], "triggers": ["낯선 사람", "소음"],
         "avg_intensity": 8.0, "log_count": 15},
    ],
    "aggression": [
        {"name": "두부", "breed": "불독", "age_months": 24,
         "issues": ["aggression"], "triggers": ["음식", "장난감"],
         "avg_intensity": 8.5, "log_count": 10},
        {"name": "바둑이", "breed": "진돗개", "age_months": 48,
         "issues": ["aggression", "territory"], "triggers": ["낯선 사람", "다른 개"],
         "avg_intensity": 9.0, "log_count": 18},
        {"name": "콩", "breed": "포메라니안", "age_months": 12,
         "issues": ["aggression"], "triggers": ["접촉", "빠른 움직임"],
         "avg_intensity": 6.5, "log_count": 7},
    ],
    "separation_anxiety": [
        {"name": "몽이", "breed": "시츄", "age_months": 30,
         "issues": ["separation_anxiety"], "triggers": ["외출 준비", "혼자 남겨짐"],
         "avg_intensity": 8.0, "log_count": 20},
        {"name": "하루", "breed": "골든리트리버", "age_months": 18,
         "issues": ["separation_anxiety", "destructive"], "triggers": ["현관문", "가방"],
         "avg_intensity": 7.0, "log_count": 14},
        {"name": "별이", "breed": "치와와", "age_months": 60,
         "issues": ["separation_anxiety"], "triggers": ["혼자", "야간"],
         "avg_intensity": 9.0, "log_count": 25},
    ],
    "destructive": [
        {"name": "뭉치", "breed": "래브라도", "age_months": 10,
         "issues": ["destructive"], "triggers": ["지루함", "혼자"],
         "avg_intensity": 7.0, "log_count": 9},
        {"name": "초코", "breed": "비글", "age_months": 14,
         "issues": ["destructive", "hyperactivity"], "triggers": ["운동 부족", "흥분"],
         "avg_intensity": 6.5, "log_count": 11},
        {"name": "구름", "breed": "사모예드", "age_months": 20,
         "issues": ["destructive"], "triggers": ["분리", "새 물건"],
         "avg_intensity": 7.5, "log_count": 13},
    ],
    "fear": [
        {"name": "솜이", "breed": "포메라니안", "age_months": 24,
         "issues": ["fear"], "triggers": ["폭죽", "천둥", "큰 소리"],
         "avg_intensity": 9.0, "log_count": 8},
        {"name": "나비", "breed": "믹스", "age_months": 72,
         "issues": ["fear", "separation_anxiety"], "triggers": ["낯선 사람", "공간 이동"],
         "avg_intensity": 7.5, "log_count": 16},
        {"name": "토리", "breed": "시바견", "age_months": 36,
         "issues": ["fear"], "triggers": ["차량", "우산", "모자"],
         "avg_intensity": 6.0, "log_count": 10},
    ],
    "hyperactivity": [
        {"name": "번개", "breed": "잭러셀테리어", "age_months": 12,
         "issues": ["hyperactivity"], "triggers": ["방문객", "공", "간식"],
         "avg_intensity": 8.0, "log_count": 22},
        {"name": "폭풍", "breed": "달마시안", "age_months": 18,
         "issues": ["hyperactivity", "barking"], "triggers": ["외출", "놀이"],
         "avg_intensity": 7.5, "log_count": 17},
        {"name": "파도", "breed": "보더콜리", "age_months": 24,
         "issues": ["hyperactivity"], "triggers": ["자극 부족", "특정 소리"],
         "avg_intensity": 7.0, "log_count": 15},
    ],
    "marking": [
        {"name": "점박이", "breed": "비글", "age_months": 18,
         "issues": ["marking"], "triggers": ["새 냄새", "다른 개 방문"],
         "avg_intensity": 5.5, "log_count": 14},
        {"name": "호두", "breed": "닥스훈트", "age_months": 30,
         "issues": ["marking", "territory"], "triggers": ["실내", "가구"],
         "avg_intensity": 6.0, "log_count": 12},
        {"name": "땅콩", "breed": "믹스", "age_months": 48,
         "issues": ["marking"], "triggers": ["스트레스", "변화"],
         "avg_intensity": 5.0, "log_count": 9},
    ],
}


def build_synthetic_user_prompt(profile: dict) -> str:
    """합성 프로필로 user_prompt 생성"""
    trend = "악화" if profile["avg_intensity"] > 7 else "안정"
    return (
        f"Dog Profile:\n"
        f"- Name: {profile['name']}\n"
        f"- Breed: {profile['breed']}\n"
        f"- Age: {profile['age_months']} months\n"
        f"- Primary Issues: {', '.join(profile['issues'])}\n"
        f"- Known Triggers: {', '.join(profile['triggers'])}\n\n"
        f"Recent Behavior Log Summary:\n"
        f"- Total logs: {profile['log_count']}\n"
        f"- Average intensity: {profile['avg_intensity']}/10\n"
        f"- Trend: {trend}\n"
        f"- Report type: DAILY\n"
        f"\n(Synthetic training data — generate realistic coaching report)"
    )


async def generate_synthetic_coaching(
    db: AsyncSession,
    category: str,
) -> list[str]:
    """
    합성 프로필 3종으로 코칭 생성.
    반환: 생성된 ai_coaching id 목록
    """
    profiles = SYNTHETIC_PROFILES.get(category, [])
    if not profiles:
        logger.warning("synthetic: unknown category=%s", category)
        return []

    coaching_ids: list[str] = []

    for profile in profiles:
        user_prompt = build_synthetic_user_prompt(profile)
        try:
            result = await openai_client.generate(
                prompts.SYSTEM_PROMPT_6BLOCK,
                user_prompt,
                model=settings.AI_COACHING_MODEL,
            )
            # JSON 파싱
            cleaned = result["content"].strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                cleaned = "\n".join(
                    lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
                )
            blocks = json.loads(cleaned)
        except (OpenAIError, json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error("synthetic coaching failed for %s: %s", profile["name"], e)
            continue

        coaching = AICoaching(
            dog_id=None,
            report_type=ReportType.DAILY,
            blocks=blocks,
            ai_tokens_used=result.get("input_tokens", 0) + result.get("output_tokens", 0),
            is_synthetic=True,
        )
        db.add(coaching)
        await db.flush()
        coaching_ids.append(str(coaching.id))

    if coaching_ids:
        # 오늘 실행 로그 기록
        log_entry = CoachingSyntheticLog(
            run_date=date.today(),
            category=category,
            generated_count=len(coaching_ids),
            coaching_ids=coaching_ids,
        )
        db.add(log_entry)
        await db.commit()
        logger.info("synthetic: generated %d records, category=%s", len(coaching_ids), category)

    return coaching_ids


async def is_already_run_today(db: AsyncSession) -> bool:
    """오늘 이미 합성 생성 실행 여부 확인"""
    q = select(CoachingSyntheticLog).where(
        CoachingSyntheticLog.run_date == date.today()
    )
    result = (await db.execute(q)).scalar_one_or_none()
    return result is not None
