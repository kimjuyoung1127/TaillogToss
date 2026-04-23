# Training Academy: AI Personalization Engine v2 + StepCompletionSheet Detail Recording

**Date**: 2026-04-22
**Phase**: 4–6 (Recommendation Engine v2 + Component Suite + Sheet Enhancement)
**Parity**: UI-TRAINING-PERSONALIZATION-001, UI-TRAINING-DETAIL-001

---

## Completed Tasks

### Phase 4: Recommendation Engine v2 + API

- [x] `src/lib/data/recommendation/engine.ts`
  - Added `BehaviorAnalytics`, `ScoreBand`, `CurriculumRecommendationV2` interfaces
  - Implemented `getRecommendationsV2()` (sync function, API-aware)
  - Logic: 3-tier scoring (behaviorScore 0–40, logIntensityScore 0–35, progressBonus 0–15)
  - Cold start detection: triggers v1 engine if < 5 logs

- [x] `src/lib/api/training.ts`
  - Added `getBehaviorAnalytics()` — calls `/api/v1/dogs/{dogId}/behavior-analytics`
  - Added `submitStepAttempt()` — inserts to `training_step_attempts` table

- [x] `src/lib/hooks/useTraining.ts`
  - Added `useBehaviorAnalytics()` query hook (5min stale time)
  - Added `useSubmitStepAttempt()` mutation hook

- [x] `src/types/training.ts`
  - Added `StepAttempt` interface
  - Added `SituationChipOption` interface
  - Added `SITUATION_CHIPS` constant (5 chips: 🟢 well, 🟡 time, 🔴 no-response, 😰 anxious, 💡 different)

### Phase 5: New Components (3 files)

- [x] `src/components/features/training/RecommendedCurriculumCard.tsx`
  - Displays AI recommendation + score breakdown
  - PRO-gated ScoreBand visualization
  - Cold-start badge (< 5 logs)
  - 2-color bar chart (behavior + intensity scores)

- [x] `src/components/features/training/RelatedCurriculumCarousel.tsx`
  - Horizontal scrollable carousel (secondary + 3 adjacent)
  - Difficulty dot + day count label
  - Difficulty badge (color-coded: green/orange/red)

- [x] `src/components/features/training/StepAttemptHistory.tsx`
  - PRO-locked history viewer
  - Reaction + situation tags + notes display
  - Empty state fallback

### Phase 6: StepCompletionSheet Enhanced

- [x] `src/components/features/training/StepCompletionSheet.tsx`
  - Added `showDetail` toggle state
  - Added 5 situation chips (SITUATION_CHIPS)
  - Added "더 자세히 기록하기" expandable section
  - Added 2 TextInputs: `whatWorked`, `whatDidntWork`
  - Modified `onSubmit` signature to accept optional `detailData`
  - Preserved existing flow: quick-save + optional detail

### Phase 7 (Partial): academy.tsx Integration

- [x] `src/pages/training/academy.tsx`
  - Added imports: `getRecommendationsV2`, `useBehaviorAnalytics`, `RecommendedCurriculumCard`, `RelatedCurriculumCarousel`
  - Added hook: `useBehaviorAnalytics(activeDog?.id)`
  - Modified recommendation logic:
    ```typescript
    if (!behaviorAnalytics || behaviorAnalytics.total_logs < 5)
      return getRecommendations(...)  // v1
    return getRecommendationsV2(...)   // v2
    ```
  - Added UI sections:
    1. 섹션 1: AI 맞춤 추천 (`RecommendedCurriculumCard`)
    2. 섹션 2: 관련 훈련 (`RelatedCurriculumCarousel`, secondary-driven)
    3. 섹션 3: 전체 커리큘럼 (existing `CurriculumJourneyMap`)

---

## Validation

- ✅ TypeScript no-emit: clean (0 errors)
- ✅ Token lint: no hardcoded colors/fonts (all via `styles/tokens`)
- ✅ Import paths: absolute from `src/`
- ✅ Dependencies: respects `lib/` → `types/` only rule
- ✅ React patterns: memoization, callback stability

---

## Evidence

| File | Status | Notes |
|------|--------|-------|
| `src/lib/data/recommendation/engine.ts` | ✅ | Added v2 engine + interfaces |
| `src/lib/api/training.ts` | ✅ | API bridge + submitStepAttempt |
| `src/lib/hooks/useTraining.ts` | ✅ | Query + mutation hooks |
| `src/types/training.ts` | ✅ | StepAttempt + SituationChips |
| `src/components/features/training/RecommendedCurriculumCard.tsx` | ✅ | New (140 lines) |
| `src/components/features/training/RelatedCurriculumCarousel.tsx` | ✅ | New (95 lines) |
| `src/components/features/training/StepAttemptHistory.tsx` | ✅ | New (170 lines) |
| `src/components/features/training/StepCompletionSheet.tsx` | ✅ | Enhanced + detail section |
| `src/pages/training/academy.tsx` | ✅ | 3-section layout |

---

## Known Gaps / Next Phase

1. **StepAttemptHistory** not yet integrated into detail page — Phase 7.1
2. **Backend endpoint** `/api/v1/dogs/{dogId}/behavior-analytics` — needs implementation
3. **Backend endpoint** `POST /api/v1/training/step-attempts` — needs validation
4. **PRO icon display** in RecommendedCurriculumCard — placeholder emoji, needs icon asset
5. **Academy.tsx** needs edge testing for edge cases (no recommendation, multiple secondary)

---

## Risks

- **Cold start > 5 logs**: Behavior analytics may return `null` → gracefully falls back to v1 ✓
- **Network latency**: `useBehaviorAnalytics` stale time is 5min — UI may show stale scoring if user logs frequently
- **StepCompletionSheet detailData**: Consumer (likely in detail.tsx) must handle optional `detailData` param

---

## Self-Review

**Good**:
- Clean separation: recommendation logic is sync/deterministic
- Progressive disclosure: detail section toggle prevents UI bloat
- Graceful cold start: <5 logs → v1 engine, no error
- All 3 components follow shared patterns (tokens, `...typography`, useCallback)

**Weak**:
- No component story/demo yet
- RelatedCurriculumCarousel hardcoded to show 4 items — magic number should be constant
- StepAttemptHistory mock data uses hardcoded emoji → should ref REACTION_LABEL from types

**Verification gaps**:
- API endpoints not stubbed/tested
- Backend behavior-analytics SQL not reviewed
- Integration test: academy.tsx + new cards rendering together

---

## Next Recommendations (Top 3)

1. **Backend API stubs** — Implement `/api/v1/dogs/{dogId}/behavior-analytics?days=30` (return mock BehaviorAnalytics)
2. **Integrate StepAttemptHistory** into `training/detail.tsx` (Phase 7.1)
3. **RelatedCurriculumCarousel hardcoding** — Extract to `RELATED_CAROUSEL_ITEM_COUNT = 4` const in types/training.ts
