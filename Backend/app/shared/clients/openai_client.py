"""
OpenAI Chat Completions 비동기 클라이언트 — 비용 제어 + 재시도
DogCoach openai_client.py 마이그레이션
"""
import logging
import time
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAIError(Exception):
    pass


class OpenAIClient:
    """비용 제어 OpenAI 클라이언트 (gpt-4o-mini, timeout 8s, retry 1회)"""

    BASE_URL = "https://api.openai.com/v1/chat/completions"

    # gpt-4o-mini 가격 (USD per 1M tokens)
    INPUT_PRICE_PER_M = 0.15
    OUTPUT_PRICE_PER_M = 0.60

    def __init__(self) -> None:
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.timeout = httpx.Timeout(float(settings.AI_LLM_TIMEOUT_SEC))

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict:
        """OpenAI 호출 → 비용 정보 포함 결과 반환

        Returns:
            {"content", "input_tokens", "output_tokens", "cost_usd", "latency_ms"}
        Raises:
            OpenAIError: 재시도 후에도 실패
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt[:settings.AI_MAX_INPUT_TOKENS]},
            ],
            "temperature": settings.AI_TEMPERATURE,
            "top_p": settings.AI_TOP_P,
            "max_tokens": settings.AI_MAX_OUTPUT_TOKENS,
        }

        max_attempts = 1 + settings.AI_MAX_RETRIES
        last_error: Optional[Exception] = None

        for attempt in range(max_attempts):
            try:
                start = time.monotonic()
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        self.BASE_URL, json=payload, headers=headers,
                    )
                    response.raise_for_status()
                latency_ms = int((time.monotonic() - start) * 1000)

                data = response.json()
                usage = data.get("usage", {})
                input_tokens = usage.get("prompt_tokens", 0)
                output_tokens = usage.get("completion_tokens", 0)
                cost_usd = (
                    input_tokens * self.INPUT_PRICE_PER_M
                    + output_tokens * self.OUTPUT_PRICE_PER_M
                ) / 1_000_000

                content = data["choices"][0]["message"]["content"]
                return {
                    "content": content,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost_usd": round(cost_usd, 6),
                    "latency_ms": latency_ms,
                }
            except Exception as e:
                last_error = e
                logger.warning(
                    "OpenAI attempt %d/%d failed: %s", attempt + 1, max_attempts, e,
                )
                if attempt < max_attempts - 1:
                    continue

        raise OpenAIError(
            f"OpenAI call failed after {max_attempts} attempts: {last_error}",
        )


openai_client = OpenAIClient()
