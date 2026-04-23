# Training Personalization + AI Coaching Upgrade (2026-04-22)

## Scope
- AI-COACHING-ANALYTICS-001: 코칭 프롬프트 강화 + 행동 분석 API
- UI-TRAINING-PERSONALIZATION-001: 훈련 추천 개인화 + 아카데미 3단계 섹션
- UI-TRAINING-DETAIL-001: 시행착오 기록 시스템 (StepCompletionSheet 확장)

## Checklist

### Phase 1: DB 마이그레이션
- [x] `supabase/migrations/20260422100000_training_step_attempts.sql` 생성
- [x] RLS 정책 (owner + trainer_read)
- [x] B2B org_id 컬럼 포함

### Phase 2: Backend Analytics API
- [x] `Backend/app/features/analytics/__init__.py`
- [x] `Backend/app/features/analytics/schemas.py`
- [x] `Backend/app/features/analytics/service.py`
- [x] `Backend/app/features/analytics/router.py`
- [x] `Backend/app/main.py` — analytics_router 등록

### Phase 3: 코칭 서비스 강화
- [x] `Backend/app/features/coaching/service.py` — `_build_behavior_analytics_text()` 추가
- [x] `Backend/app/features/coaching/prompts.py` — "Behavior Analytics" 섹션
- [x] `Backend/app/features/coaching/schemas.py` — `analytics_metadata` 필드
- [x] `src/types/coaching.ts` — `analytics_metadata` 타입
- [x] `src/components/features/coaching/AnalysisBadge.tsx` 신규
- [x] `src/pages/coaching/result.tsx` — AnalysisBadge 통합

### Phase 4: 추천 엔진 v2 + academy.tsx
- [x] `src/lib/data/recommendation/engine.ts` — `getRecommendationsV2`, `ScoreBand`, `BehaviorAnalytics`
- [x] `src/lib/api/training.ts` — `getBehaviorAnalytics`, `submitStepAttempt`
- [x] `src/lib/hooks/useTraining.ts` — `useBehaviorAnalytics`, `useSubmitStepAttempt`
- [x] `src/pages/training/academy.tsx` — 3단계 섹션, cold start fallback

### Phase 5: 신규 컴포넌트
- [x] `src/components/features/training/RecommendedCurriculumCard.tsx`
- [x] `src/components/features/training/RelatedCurriculumCarousel.tsx`
- [x] `src/components/features/training/StepAttemptHistory.tsx`
- [x] `src/components/features/training/ReactionTrendBar.tsx` — 반응 추이 시각화 (PRO)
- [x] `src/components/features/training/StreakBadge.tsx` — 연속 훈련 배지 (무료)

### Phase 6: StepCompletionSheet 확장
- [x] `src/types/training.ts` — `StepAttempt`, `SITUATION_CHIPS`
- [x] `src/components/features/training/StepCompletionSheet.tsx` — 2경로 확장

### Phase 7 빠른 윈
- [x] `difficulty_note` UI — MissionChecklist.tsx L69에서 이미 활성화 확인

### Phase 7-b: 누락 항목 완료
- [x] `Backend/tests/test_behavior_analytics.py` — pytest 5/5 PASS
- [x] `src/pages/training/detail.tsx` — useSubmitStepAttempt 연결 + StepAttemptHistory 모달
- [x] `src/components/features/ops/RecordModal.tsx` — B2B 훈련이력 탭 추가

### Phase 8 SSOT
- [x] `docs/status/PAGE-UPGRADE-BOARD.md` 상태 갱신
- [x] `docs/ref/BEHAVIOR-ANALYTICS-GUIDE.md` 신규
- [x] `docs/ref/TRAINING-PERSONALIZATION-GUIDE.md` 신규
- [x] `docs/status/PROJECT-STATUS.md` Parity ID 추가 (AI-COACHING-ANALYTICS-001, UI-TRAINING-PERSONALIZATION-001, UI-TRAINING-DETAIL-001)
- [x] `docs/ref/SUPABASE-SCHEMA-INDEX.md` — training_step_attempts 추가

### Phase 9: QA 버그픽스 + 에셋 교체 (세션 2~3)

- [x] `src/components/shared/layouts/ModalLayout.tsx` — SafeArea(iOS 홈인디케이터 34pt) + backdrop dismiss
- [x] `src/components/features/ops/RecordModal.tsx` — 훈련탭 footer 조건부 (`activeTab === 'record'`)
- [x] `src/pages/training/detail.tsx` — ReactionTrendBar + StreakBadge 실렌더링, StepAttemptHistory 실데이터, SafeArea + backdrop dismiss 히스토리 모달
- [x] `src/lib/data/recommendation/engine.ts` — secondary null 폴백 (단일 후보 시 미완료 커리큘럼 fallback)
- [x] `Backend/app/features/analytics/router.py` — `GET /{dog_id}/step-attempts` 엔드포인트
- [x] `Backend/app/shared/models.py` — `TrainingStepAttempt` SQLAlchemy 모델
- [x] `Backend/app/features/analytics/schemas.py` — `StepAttemptResponse` Pydantic
- [x] `Backend/app/features/analytics/service.py` — `get_step_attempts()` 함수
- [x] `src/lib/api/training.ts` — `getStepAttempts()` 프론트 브릿지
- [x] `src/lib/hooks/useTraining.ts` — `useStepAttempts()` 훅
- [x] `src/lib/data/published/*/curriculum.ts` — 제목 불필요 텍스트 제거 (2파일)
- [x] `src/lib/data/curriculumIconAssets.ts` — base64 URI 방식 재작성 (Granite.js require() 미지원)
- [x] `src/components/features/training/CurriculumCard.tsx` — 이모지→Image base64 URI
- [x] `src/components/features/training/CurriculumShowcaseCard.tsx` — 이모지→Image base64 URI
- [x] `src/pages/training/detail.tsx` — heroEmoji→Image base64 URI

### Phase 12: UX 버그픽스 추가 (세션 6)

- [x] `src/components/features/coaching/PlanSelector.tsx` — `isPro` prop 제거, Plan C 잠금 완전 해제
- [x] `src/pages/training/detail.tsx` — `PlanSelector` `isPro` prop 제거
- [x] `src/components/features/training/DayTabBar.tsx` — `View → ScrollView horizontal`, Day 5 잘림 수정

### Phase 11: UX 버그픽스 + PRO 잠금 해제 (세션 5)

- [x] `src/components/features/training/VariantSelector.tsx` — Plan C `proOnly: false` 잠금 해제
- [x] `src/components/shared/layouts/ModalLayout.tsx` — `SafeAreaProvider` 내부 wrap + `useSafeAreaInsets().bottom` Android 네비게이션 바 대응
- [x] `src/_app.tsx` — `SafeAreaProvider` 루트 추가
- [x] `src/components/features/training/StepAttemptHistory.tsx` — `isPro` prop 제거, PRO 잠금 화면 삭제
- [x] `src/components/features/training/AttemptHistorySheet.tsx` — `isPro` prop 제거, SafeAreaProvider 내부 추가 + `useSafeAreaInsets` 적용
- [x] `src/components/features/ops/RecordModal.tsx` — `StepAttemptHistory` `isPro` prop 제거
- [x] `src/pages/training/detail.tsx` — 시도이력 버튼 텍스트 PRO 분기 제거, `AttemptHistorySheet` `isPro` prop 제거

### Phase 10: 커리큘럼 철학 재정의 + Plan 자동 추천 (세션 4)

- [x] `src/types/training.ts` — `PlanPhilosophy`, `PlanMeta` 타입 추가
- [x] `curriculum.ts` — `planMeta` 전체 7개 커리큘럼 추가 (A=Focus, B=PlayBased, C=Adaptive)
- [x] `curriculum.ts` — altB/C 전체 109스텝 100% 채우기 (impulse_control, socialization, fear_desensitization 이월 완료)
- [x] `curriculum.ts` — `variant_notes` C 레이블 커리큘럼별 갱신 (35개 day, step 헬퍼 기본값 2개 유지)
- [x] `src/components/features/training/VariantSelector.tsx` — 철학 뱃지(Focus/PlayBased/Adaptive) + ideal_for UI
- [x] `src/pages/training/detail.tsx` — 5개 컴포넌트 분리 (700→446줄), planMeta 전달
- [x] `src/components/features/training/CurriculumHeroCard.tsx` — 신규
- [x] `src/components/features/training/DayProgressIndicator.tsx` — 신규
- [x] `src/components/features/training/DayTabBar.tsx` — 신규
- [x] `src/components/features/training/CelebrationModal.tsx` — 신규
- [x] `src/components/features/training/AttemptHistorySheet.tsx` — 신규
- [x] `src/lib/data/recommendation/engine.ts` — `recommendPlan(DogPlanSignals)` 추가
- [x] `src/pages/training/detail.tsx` — `useDogEnv` + `recommendPlan` 연결 (첫 시작 자동 Plan)
- [x] `.claude/automations/training-data-maintenance.prompt.md` — 신규 (매주 금요일 10:00)
- [x] `docs/status/TRAINING-DATA-LOG.md` — altB/C 100% 완료 반영
- [x] `docs/status/TRAINING-PLAN-CHECKLIST.md` — 전체 4 Phase 완료 체크

## Validation
- `tsc --noEmit` → 0 errors ✅ (전 세션 포함 누적)
- `pytest Backend/tests/test_behavior_analytics.py` → 5/5 PASS ✅
- Migration `20260422100000` → remote 적용 완료 ✅
- 실주행: "최근 기록 23개 분석 결과" 실데이터 연결 확인 ✅
- 커리큘럼 아이콘 이미지 표시 확인 (base64 URI 교체 후) ✅
- altB/C 100% 커버리지 (109/109스텝) ✅
- variant_notes C 레이블 35개 커리큘럼별 교체 ✅
- `recommendPlan` → 노령·대형견 C / 불안·반응성 B / 기본 A ✅

## Notes
- VAR-2 해결: `getRecommendationsV2`는 동기 함수, API 결과를 파라미터로 받음
- VAR-4 해결: training_behavior_snapshots 미사용, behavior_logs 직접 집계
- Cold start: 로그 5개 미만 시 기존 설문 기반 엔진 fallback
- `training_step_attempts`는 기존 `user_training_status.reaction/memo`와 별개 (VAR-1)
