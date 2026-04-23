# Training Personalization Guide

훈련 추천 개인화 엔진 설계 레퍼런스.
Parity: UI-TRAINING-PERSONALIZATION-001, UI-TRAINING-DETAIL-001

---

## ScoreBand 모델

`src/lib/data/recommendation/engine.ts`

| 항목 | 점수 | 설명 |
|------|------|------|
| `behaviorScore` | 0–40 | 설문 행동과 커리큘럼 행동 매핑 강도 |
| `logIntensityScore` | 0–35 | behavior_logs avg_intensity 기반 긴급도 |
| `progressBonus` | 0–15 | 인접 커리큘럼 완료 여부 보너스 |
| `personalizationBoost` | 0–10 | 로그 데이터 풍부도 부스트 |
| **total** | **0–100** | 최종 추천 점수 |

**ScoreBand는 PRO 전용** — 무료 사용자에게는 점수 숫자 미노출.

---

## 추천 엔진 v2 (동기 함수)

```ts
getRecommendationsV2(
  behaviors: BehaviorType[],
  completedIds: CurriculumId[],
  logAnalytics: BehaviorAnalytics,   // useQuery 결과를 파라미터로 받음
): CurriculumRecommendationV2
```

- VAR-2 해결: 동기 함수 유지 → `useMemo`에서 안전하게 호출 가능
- `logAnalytics`는 `useBehaviorAnalytics()` useQuery가 별도 관리

---

## Plan A/B/C 초기 추천 (`recommendPlan`)

`src/lib/data/recommendation/engine.ts`

```ts
recommendPlan(signals: DogPlanSignals): PlanVariant
```

훈련 첫 시작 시 dogEnv 기반으로 초기 Plan을 자동 설정.

| Plan | 조건 | 의미 |
|------|------|------|
| C (Adaptive) | 나이 7살+ / 체중 25kg+ / 통증 있음 | 노령·대형·컨디션 조정 |
| B (PlayBased) | anxiety·reactivity 행동 / 에너지 ≤2 / 놀이선호 ≥4 / 소음예민 ≥4 | 놀이 기반 부드러운 접근 |
| A (Focus) | 위 조건 미해당 | 집중 훈련 기본 |

**신호 소스**: `Dog.birth_date`, `Dog.weight_kg`, `DogEnv.health_meta.physical_stats.has_pain`, `DogEnv.activity_meta.energy_score`, `DogEnv.activity_meta.rewards_meta.play`, `DogEnv.household_info.noise_sensitivity`, `DogEnv.health_meta.chronic_issues`

**연결**: `detail.tsx` useEffect — progress 없을 때(첫 시작) dogEnv 로드 완료 후 `setVariant(recommended)`.

---

## 아카데미 3단계 섹션

`src/pages/training/academy.tsx`

```
[섹션 1] 🎯 AI 맞춤 추천   (RecommendedCurriculumCard)
[섹션 2] 📚 관련 훈련       (RelatedCurriculumCarousel) — secondary 있을 때만
[섹션 3] 📋 전체 커리큘럼  (CurriculumJourneyMap)
```

---

## PRO 잠금 구조

| 기능 | 무료 | PRO |
|------|------|-----|
| 설문 기반 추천 표시 | ✅ | ✅ |
| ScoreBand 점수 분해 | ❌ | ✅ |
| AI 격려 메시지 (스텝별) | ❌ | ✅ |
| 시도 이력 열람 | ✅ | ✅ |
| 반응 추이 그래프 | ❌ | ✅ |

---

## 훈련 상세 UX — 시행착오 기록 시스템

### training_step_attempts 테이블

`supabase/migrations/20260422100000_training_step_attempts.sql`

- `user_training_status.reaction/memo`와 별개 — 시도별 상세 기록용
- RLS: owner(B2C 읽기/쓰기) + trainer_read(B2B 훈련사 읽기)

### StepCompletionSheet 2경로

**경로 1 (기본)**: 반응 선택 → 저장 → `user_training_status` 업데이트

**경로 2 (상세, 선택)**: 반응 → 상황 칩 → 텍스트 → 저장
→ `user_training_status` + `training_step_attempts` 동시 저장

### 상황 칩 옵션 (`SITUATION_CHIPS`)

| 칩 | 색상 |
|----|------|
| 잘 됐어요 | 초록 |
| 처음엔 어려워했지만 | 노랑 |
| 반응이 없었어요 | 회색 |
| 불안해했어요 | 빨강 |
| 다른 방법으로 해봤어요 | 파랑 |

---

## 관련 컴포넌트

| 컴포넌트 | 파일 | 용도 |
|----------|------|------|
| `RecommendedCurriculumCard` | `components/features/training/` | AI 추천 카드 (ScoreBand PRO 잠금) |
| `RelatedCurriculumCarousel` | `components/features/training/` | 관련 커리큘럼 가로 스크롤 |
| `StepAttemptHistory` | `components/features/training/` | 시도 이력 (PRO 잠금) |
| `ReactionTrendBar` | `components/features/training/` | 반응 추이 시각화 (PRO 잠금) |
| `StreakBadge` | `components/features/training/` | 연속 훈련 배지 (무료) |
