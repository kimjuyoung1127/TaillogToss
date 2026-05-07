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
