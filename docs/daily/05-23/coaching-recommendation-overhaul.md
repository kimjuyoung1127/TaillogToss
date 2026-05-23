# 2026-05-23 — AI 추천 디테일 + 컨텍스트 격리 + 추천 동기화 Overhaul

> Plan: `~/.claude/plans/majestic-fluttering-beaver.md`
> 영향 Parity: AI-001, UIUX-005, UI-TRAINING-PERSONALIZATION-001, UIUX-002

## Scope

표면 UX 3종 + 데이터/로직 근본 3종 문제를 한 번에 해결하는 통합 작업. 단일 세션에서 8 Phase 완료, 모든 단위 테스트 + DigitalOcean 배포 2회 검증.

## 완료된 Phase (8/9)

| Phase | 결과 | 핵심 변경 |
|---|---|---|
| **1. focused-coaching API** | ✅ + 배포 검증 | `/api/v1/coaching/generate-focused` 신규, `_filter_behavior_analytics_by_context()`, build_focused_user_prompt(), FE 라우팅 분기 |
| **2. behavior_analytics 다차원** | ✅ + 배포 검증 | 환경(location) top 3, 시간대 피크 건수, 메모 키워드 top 5 (~200 tokens 증가) |
| **3. AI 프롬프트 디테일** | ✅ + 배포 검증 | Block ① key_patterns 빈도 인용, Block ② evidence_from_intake 강제, Block ④ tasks 표준 포맷 |
| **4. DigitalOcean 배포** | ✅ | force-build 2회 (`720580a6`, `b9436988`) 모두 ACTIVE, `/health` 200 + `/generate-focused` 401 |
| **5. LockedBlock 미리보기** | ✅ | BLOCK_META.previewItems, lockTeaser 직후 bullet 4개 노출 |
| **6. 7일 플랜 Swipeable + dots** | ✅ | snapToInterval + 7 dots indicator + 오늘 day 자동 스크롤 |
| **7. 코칭↔Academy 동기화** | ✅ | engine 4번째 인자 `recentCoachingReferenceIds`, +20 coachingBonus, "최근 코칭 추천" 배지 |
| **8. ScoreBand v3 다차원** | ✅ | progressBonus(+8) + memoKeywordScore(0~15) + 종합 점수 게이지 + PRO 5종 분해 |
| **9. adb 실기기 QA** | ✅ 부분 (academy 시나리오 6) | 메이 실기기 진단 + DEV/PROD 양쪽 36~44.png |
| **10. Phase 7 A-2 후속 + 점수 셀 가독성** | ✅ + AIT 배포 검증 | `getRecommendationsFromCoaching` cold-start 우회 helper, `TodayTrainingCard`가 추천 primary 기준, scoreStyles.value width 36→minWidth 52 |

## 검증 결과

| 카테고리 | 결과 |
|---|---|
| pytest (`tests/test_coaching_prompts.py`) | **12/12 PASS** (기존 6 + Phase 1 신규 4 + Phase 3 신규 2) |
| jest (engine + LockedBlock + coaching.ts) | **신규 15건 PASS** (LockedBlock 4·2 + engine 9, 회귀 무) |
| TypeScript `tsc --noEmit` | 깨끗 (별개 untracked ShareRewardCard 1건 무관) |
| DO `/health` | HTTP 200 |
| DO `/generate-focused` | HTTP 401 (라우터 등록 + 인증 미들웨어 작동) |
| DO `/generate` | HTTP 401 (회귀 없음) |
| 안전장치 (한국어/safety/risk≤3/7일×2-3) | 회귀 없음 |

## Commits (codex + main fast-forward 동기화)

- `4fe861e` — Phase 1: focused-coaching API + 격리 로직
- `_` — Phase 5+1회귀: LockedBlock previewItems + coaching.test 라우팅 분기
- `_` — Phase 6: 7일 Swipeable + dots
- `_` — Phase 7: 코칭↔Academy 동기화 + coachingBonus
- `_` — Phase 2+3: analytics 다차원 + 프롬프트 디테일
- `_` — Phase 8: ScoreBand v3 + 종합 점수 게이지

## 메모리 추가

- `feedback_be_deploy_required.md` — BE 수정 = DO 배포 + 프로덕션 헬스체크 1세트
- `feedback_adb_screenshot_qa.md` — FE UI 변경 = adb 실기기 스크린샷 의무
- `reference_do_backend_deploy_skill.md` — `~/.codex/skills/toss-do-backend-deploy` + force-build로 stale 405 해결 패턴

## Feature Flag

`src/lib/flags.ts:AI_RECOMMENDATION_V3 = true`. 문제 발생 시 false로 즉시 rollback (v2 fallback은 코드 경로상 자동 유지).

## 남은 작업 (Phase 9 QA)

| 시나리오 | 캡처 대상 |
|---|---|
| 1 | `/coaching/result` 무료 → 블록 ④⑤⑥ previewItems 노출 |
| 2 | `/coaching/result` PRO → 블록 ④ Swipeable + dots Day 1 |
| 3 | `/coaching/result` PRO → 블록 ④ Swipeable + dots Day 4 (스와이프 동작) |
| 4 | `/training/academy` 무료 → 종합 점수 게이지 + "PRO에서" CTA |
| 5 | user_context "분리불안" 입력 → 6블록 격리 결과 (다른 행동 누락) |
| 6 | 코칭 후 academy → "최근 코칭 추천" 배지 + ranking 변경 |

활용 스킬: `Skill("toss-dev-server")`, `Skill("toss-mock-auth-ops")`, `Skill("toss-sandbox-metro")`

## Risks / Follow-up

- LLM이 격리 지시 준수 여부는 실제 호출 검증 필요 (Phase 9 시나리오 5)
- ScoreBand v3 점수 분포 변경으로 기존 추천 ranking이 일부 바뀔 수 있음 → 사용자 학습 경로 영향 모니터링
- Phase 2 토큰 증가 ~200 → 일일 OpenAI 비용 약간 상승 예상 (budget 모니터링)

## Phase 10 — Phase 7 A-2 follow-up (16:00 KST 추가)

### 문제
DEV/PROD 양쪽 academy에서 "오늘의 훈련" 카드가 코칭 추천이 아닌 화장실 가이드 67%를 보여줌. 사용자 메이는 0 logs라 cold-start path로 빠져 Phase 7 코칭 boost 무효화, 그리고 `activeProgress`(in_progress 첫 항목)가 추천 로직과 무관하게 화장실 가이드를 그대로 노출했음. 추가로 "AI 맞춤 추천" 카드의 점수 `20/100`이 셀 폭 부족으로 `20/10\n0`으로 줄바꿈됨.

### 처리
- `src/lib/data/recommendation/engine.ts` — `getRecommendationsFromCoaching(refs, completed)` helper 신규. coaching reference만으로 primary/secondary 선정, scoreBand `{coachingBonus:20, total:20}`, invalid/all-completed 시 `null` 반환(cold-start fallback 신호).
- `src/pages/training/academy.tsx`
  - cold-start 직전 분기에서 `recentCoachingReferenceIds.length > 0` 시 `getRecommendationsFromCoaching` 우선.
  - `TodayTrainingCard` 시그니처 `{progress}` → `{curriculumId, progress|null}`. progressMap.get(primary)로 옵셔널 동기. hasProgress=false일 때 일차/진행률 숨김 + "오늘 시작하기 →" CTA.
  - dead `activeProgress` useMemo 제거.
- `src/components/features/training/RecommendedCurriculumCard.tsx` — `scoreStyles.value` `width:36` → `minWidth:52` + `<Text numberOfLines={1}>`.

### 검증
| 단계 | 결과 |
|---|---|
| `tsc --noEmit` | PASS (ShareRewardCard 기존 무관 에러만) |
| jest engine.test.ts (Phase 7 A-2 4건) | 13/13 PASS |
| DEV Fast Refresh academy | 용기 내기 수업 2일차 20% + 이어서 하기 + 20/100 한 줄 (36, 37.png) |
| `ait build` | deploymentId `019e53a0-3658-7c2e-9d58-68766b1a2890` |
| 번들 스캔 | supabase URL ✅, brandIcon HTTPS ✅, isDevToolsEnabled=false ✅, ait-ad-test-* 0개 ✅ |
| `ait deploy --scheme-only` | `intoss-private://taillog-app?_deploymentId=019e53a0-3658-7c2e-9d58-68766b1a2890` |
| PROD `viva.republica.toss` 진입 | 씩씩한 독립심 클래스 + 오늘 시작하기 + 20/100 한 줄 (43, 44.png) |
| BE health (`/health` 200, `/api/v1/coaching/generate-focused` 401) | PASS — BE 재배포 불필요 (FE only 패치) |

### Files
- `src/lib/data/recommendation/engine.ts` (+helper)
- `src/lib/data/recommendation/__tests__/engine.test.ts` (+4 tests)
- `src/pages/training/academy.tsx`
- `src/components/features/training/RecommendedCurriculumCard.tsx`
- `qa-screenshots/05-23-ait-upload/{30..44}.png`

### Production deploymentId 갱신
- 신규: `019e53a0-3658-7c2e-9d58-68766b1a2890` (16:00 KST)
- 이전 deploymentId(들)는 콘솔 history에서만 확인.
