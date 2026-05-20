from app.features.coaching import prompts


def test_build_user_prompt_includes_ai_persona_preferences():
    prompt = prompts.build_user_prompt(
        dog_name="정베",
        breed="믹스",
        age_months=24,
        issues=["barking"],
        triggers=["noise"],
        behavior_analytics="No recent logs",
        ai_persona={"tone": "solution", "perspective": "dog"},
    )

    assert "AI Coaching Preference" in prompt
    assert "솔루션 중심 톤" in prompt
    assert "강아지 입장에서" in prompt


def test_build_user_prompt_injects_user_context():
    """user_context가 프롬프트에 PRIMARY 컨텍스트로 주입되는지 확인"""
    ctx = "오늘 공원에서 다른 강아지를 보자마자 줄을 잡아당겼어요"
    prompt = prompts.build_user_prompt(
        dog_name="홀리",
        breed="말티즈",
        age_months=18,
        issues=["aggression"],
        triggers=["other_dogs"],
        behavior_analytics="3 logs this week",
        user_context=ctx,
    )
    assert "Today's Special Situation" in prompt
    assert ctx in prompt
    assert "PRIMARY" in prompt


def test_build_user_prompt_no_user_context_section_when_none():
    """user_context=None 이면 해당 섹션 미포함"""
    prompt = prompts.build_user_prompt(
        dog_name="홀리",
        breed="말티즈",
        age_months=18,
        issues=["barking"],
        triggers=["noise"],
        behavior_analytics="2 logs",
        user_context=None,
    )
    assert "Today's Special Situation" not in prompt
    assert "PRIMARY" not in prompt


def test_build_user_prompt_empty_string_user_context_not_injected():
    """user_context 빈 문자열도 섹션 미포함 (trim 처리 확인)"""
    prompt = prompts.build_user_prompt(
        dog_name="홀리",
        breed="말티즈",
        age_months=18,
        issues=["barking"],
        triggers=["noise"],
        behavior_analytics="2 logs",
        user_context="",
    )
    assert "Today's Special Situation" not in prompt


def test_build_user_prompt_multiple_situations_combined():
    """체크박스 + 자유입력 결합된 컨텍스트 처리"""
    ctx = "오늘 발생한 상황: 산책 중 줄 당김, 낯선 사람 방문 시 짖음\n문 앞에서 10분간 계속 짖었어요"
    prompt = prompts.build_user_prompt(
        dog_name="초코",
        breed="포메라니안",
        age_months=12,
        issues=["barking"],
        triggers=["strangers"],
        behavior_analytics="5 logs",
        user_context=ctx,
    )
    assert "산책 중 줄 당김" in prompt
    assert "낯선 사람 방문 시 짖음" in prompt
    assert "10분간 계속 짖었어요" in prompt
