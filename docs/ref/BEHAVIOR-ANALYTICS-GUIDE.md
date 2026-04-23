# Behavior Analytics Guide

행동 분석 엔진 설계 및 API 레퍼런스.
Parity: AI-COACHING-ANALYTICS-001, UI-TRAINING-PERSONALIZATION-001

---

## 설계 원칙

- **SQL 집계 기반** — `behavior_logs` 직접 집계. 임베딩/Vector DB 미사용.
- **`training_behavior_snapshots` 미사용** — UNIQUE(`user_id, dog_id, curriculum_id`) 제약으로 날짜별 이력 불가. 추후 개선 예정.
- **인덱스** — `idx_logs_dog_occurred(dog_id, occurred_at)` 활용.

---

## API

### GET /api/v1/dogs/{dog_id}/behavior-analytics

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `days`   | int  | 30     | 집계 기간 (일) |

**응답 (BehaviorAnalyticsResponse)**

```json
{
  "dog_id": "uuid",
  "analysis_days": 30,
  "total_logs": 23,
  "top_behaviors": ["barking", "jumping"],
  "avg_intensity_by_behavior": { "barking": 7.2, "jumping": 4.1 },
  "weekly_trend": { "barking": "worsening", "jumping": "stable" },
  "peak_hour": 19,
  "stats": [
    { "behavior": "barking", "count": 15, "avg_intensity": 7.2, "trend": "worsening" }
  ]
}
```

**weekly_trend 값**

| 값 | 조건 |
|----|------|
| `improving` | 이번주 avg_intensity − 지난주 avg_intensity ≤ −0.5 |
| `worsening` | 이번주 avg_intensity − 지난주 avg_intensity ≥ +0.5 |
| `stable`    | 그 외, 또는 데이터 부족 |

---

## 백엔드 구현

| 파일 | 역할 |
|------|------|
| `Backend/app/features/analytics/service.py` | `get_behavior_analytics()` — 집계 로직 |
| `Backend/app/features/analytics/schemas.py` | `BehaviorAnalyticsResponse`, `BehaviorStat` |
| `Backend/app/features/analytics/router.py` | FastAPI 라우터 |
| `Backend/tests/test_behavior_analytics.py` | pytest 5케이스 |

---

## 코칭 서비스 통합

`Backend/app/features/coaching/service.py` — `_build_behavior_analytics_text()`:

1. `behavior_logs` 집계 → 행동별 avg_intensity, count, 시간대 분포
2. 추이 판정 (improving / stable / worsening)
3. 프롬프트 "Behavior Analytics" 섹션에 주입
4. `CoachingResponse.analytics_metadata` 에 `{log_count, analysis_days, top_behavior}` 반환

프론트엔드: `src/components/features/coaching/AnalysisBadge.tsx`
→ "최근 N일 N개 기록 분석 · {top_behavior}" 배지 표시

---

## 프론트엔드

| 파일 | 역할 |
|------|------|
| `src/lib/api/training.ts` | `getBehaviorAnalytics(dogId, days?)` |
| `src/lib/hooks/useTraining.ts` | `useBehaviorAnalytics(dogId)` — 5분 staleTime |
| `src/pages/training/academy.tsx` | cold start fallback (total_logs < 5) + 3섹션 렌더 |

**Cold Start 전략**

```ts
if (!logAnalytics || logAnalytics.total_logs < 5) {
  return getRecommendations(behaviors, completedIds);   // v1 설문 기반
}
return getRecommendationsV2(behaviors, completedIds, logAnalytics);  // v2 로그 기반
```
