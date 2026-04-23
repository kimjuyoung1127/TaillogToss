# 2026-04-20 UI/UX Phase 1~3

Parity: APP-001, LOG-001, UI-001

## Phase 1 — S급 버그 수정

- [x] `settings/index.tsx`: 회원탈퇴 후 `queryClient.clear()` + `logout()` + `/onboarding/welcome` 이동
- [x] `settings/index.tsx`: TopBar `canGoBack` 가드 — 탭 진입 시 뒤로가기 버튼 숨김
- [x] `login.tsx`: 슬로건 `'반려견 행동, 90초면 기록 끝'` → `'반려견 행동 기록부터 AI 코칭까지'`

## Phase 2 — 로그인 화면 디자인

- [x] `login.tsx`: 배경 `grey950` + `rgba(0,0,0,0.45)` 다크 오버레이
- [x] `login.tsx`: 로고 플레이스홀더 → `LottieAnimation asset="cute-doggie" size={180}`
- [x] `login.tsx`: 버튼 그림자, 에러 배너 다크 배경 대비 개선

## Phase 3 — 기록 삭제 UI

- [x] `useLogs.ts`: `useDeleteLog(dogId)` 낙관적 업데이트 뮤테이션 추가
- [x] `LogCard.tsx`: `onDelete` prop + `onLongPress` Alert 확인 삭제
- [x] `dashboard/index.tsx`: `useDeleteLog` 연결, `LogCard`에 `onDelete` 전달

## 탈퇴 플로우 버그 수정 (후속)

- [x] `withdraw-user` Edge Function 신규 작성 + 배포 (v3, verify_jwt=false)
  - 근본 원인: Supabase JWT 알고리즘 HS256→ES256 전환으로 verify_jwt=true 게이트웨이 401
  - 수정: verify_jwt=false + 내부 `/auth/v1/user` Admin API로 JWT 서명 검증
  - E2E: 실 ES256 토큰으로 `{"ok":true,"withdrawn":true}` 확인
- [x] `settings/index.tsx`: 탈퇴 후 `clearAuthState()` 추가 (AuthContext isAuthenticated 즉시 초기화)
- [x] `settings/index.tsx`: catch 블록 에러 코드 노출 + `console.error` 추가
- [x] `withdraw-user.test.ts`: 14개 단위 테스트 (verifyJwtOwner 경로 포함) 작성

## Phase 4 — Opus 자기리뷰 반영

- [x] 탈퇴 후 `queryClient.clear()` 추가 (Phase 1 보강)
- [x] 에러 배너 색상 개선 (Phase 2 보강)

## Phase 5 — 진입점 단일화 + 보안 수정 (2026-04-20 후속)

- [x] `welcome.tsx`: Toss 로그인 CTA 통합 (`login.tsx` 기능 흡수) — skipAuth, handleTossLogin, 에러 배너, terms row
- [x] `login.tsx` 삭제 (`src/pages/` + `pages/` 양쪽)
- [x] 미인증 진입점 `/onboarding/welcome` 단일화: `deepEntry.ts` DEFAULT_ROUTE, `authGuard.ts`, `onboardingGuard.ts`, `usePageGuard.ts`, `index.tsx`, `_404.tsx`, `survey.tsx`, `notification.tsx` 전체 교체
- [x] `src/lib/api/supabase.ts`: 하드코딩 Supabase URL/anon_key 제거 → env vars로 전환 (보안)
- [x] `babel.config.js`: `transform-inline-environment-variables` include 4개 변수만 인라인 (RN 내부 변수 보호)
- [x] `src/styles/tokens.ts`: `orange50: '#FFF7ED'` 추가
- [x] `src/pages/onboarding/notification.tsx` L209: `'#FFF7ED'` → `colors.orange50` 토큰화
- [x] 테스트 3파일: `/login` 기대값 → `/onboarding/welcome` 수정

## 검증

- tsc --noEmit: 0 에러
- 상태: Done (실기기 QA 미실시)

---

## Phase 6 — AI 코칭 실연동 + Plan C UX (2026-04-20 후속)

Parity: AI-001, UI-001

### M0-A: 보안 — coaching feedback 소유권 검증
- [x] `Backend/app/features/coaching/router.py`: `submit_feedback`에 `user_id` 전달
- [x] `Backend/app/features/coaching/service.py`: `verify_dog_ownership` 추가 (타인 coaching_id로 점수 변조 차단)

### M0-B: 토큰 수정
- [x] `StepCompletionSheet.tsx`: `warningAmber: '#FFF8E1'` → `colors.orange50`
- [x] `StepCompletionSheet.tsx`: 저장 후 자동 닫기 제거 → `onSaved` prop + "확인" 버튼으로 수동 닫기
- [x] `training/detail.tsx`: `setTimeout 1s` 제거, `handleFeedbackSaved` 콜백으로 분리

### M1: OpenAI API Key 활성화
- [x] `Backend/.env`: OPENAI_API_KEY 주입 (taillog_labeling/.env.local 소스)
- [x] `Backend/.env`: DATABASE_URL 비밀번호 실값 주입

### M2: notification 토큰 정리
- [x] `src/pages/onboarding/notification.tsx`: `heading.fontSize:24` → `...typography.t3`
- [x] `heroSection.paddingTop: 20` → `12`

### M3: DB drift 수정 (subscriptions 모델)
- [x] `Backend/app/shared/models.py`: `canceled_at`, `cancel_reason` 미사용 컬럼 제거 (DB에 없어서 500 에러 유발)

### M4: CoachingGenerationLoader 5단계 애니메이션
- [x] `src/components/features/coaching/CoachingGenerationLoader.tsx`: 3단계 → 5단계 (행동 수집/패턴 분석/AI 추론/플랜 생성/코칭 완성)
- [x] StepRow fade-in + spring bounce, 이모지 scale bounce, 진행 점 애니메이션

### M5: FreeBlock Plan C UX
- [x] `InsightBlockView`: summary 타이핑 효과 (25ms/char), 트렌드 게이지 바 (improving/stable/worsening)
- [x] `DogVoiceBlockView`: Lottie 아바타 (happy→cute-doggie, tired→long-dog, anxious→jackie)
- [x] `CheckboxItem`: 완료 시 bg flash (green50, 200ms → 300ms 복귀, useNativeDriver: false)

### 런타임 수정: AI 코칭 실패 근본 원인
- [x] `Backend/app/core/config.py`: `AI_MAX_OUTPUT_TOKENS: 260 → 1800` (JSON truncation 방지)
- [x] `Backend/app/core/config.py`: `AI_LLM_TIMEOUT_SEC: 8 → 30` (OpenAI 응답 대기 충분히)
- [x] `adb reverse --remove-all` 후 재등록으로 포트 포워딩 복구

### 검증
- POST /api/v1/coaching/generate → 200 OK (WARNING 없음, AI 경로 완전 성공) ✅
- training/detail 반응 모달 수동 닫기 확인 필요 (실기기)
- CoachingGenerationLoader 5단계 시각 확인 필요 (실기기)

## Phase 7 — 중복 뒤로가기 버튼 제거 + MSG-001 Sandbox (2026-04-20)

### 전 페이지 screenOptions 적용
- [x] 21개 라우트 전체 `screenOptions: { headerShown: false }` 추가 (`createRoute()` 옵션)
  - 대상: legal/terms, legal/privacy, training/academy, training/detail, coaching/result, settings/index, settings/subscription, dog/add, dog/switcher, dog/profile, dashboard/index, dashboard/quick-log, dashboard/analysis, pages/index, pages/_404, onboarding/survey, onboarding/notification, onboarding/welcome, ops/today, ops/settings, parent/reports
  - 원인: Granite(React Navigation NativeStack) 기본값 `headerShown: true` → 커스텀 TopBar와 중복 뒤로가기 버튼 노출

### MSG-001 Smart Message Sandbox 발송
- [x] Toss 콘솔 캠페인 생성: `테일로그 행동 기록 알림`
- [x] 기능성 타입, templateCode: `taillog-app-TAILLOG_BEHAVIOR_REMIND`
- [x] A안/B안 Sandbox 발송 → **발송됨** 확인 (2026-04-20)
- [ ] 토스팀 검토 승인 후 FastAPI 연동 대기

### screenOptions 누락 2개 추가
- [x] `survey-result.tsx`, `report/[shareToken].tsx` → `screenOptions: { headerShown: false }` 추가 (총 23/23 완료)

## Phase 8 — 토큰 준수 완료 + MSG-001 코드 연동 (2026-04-20)

### B2B/B2C 컴포넌트 색상 토큰화
- [x] `tokens.ts`: `blue200`, `blue800`, `aiSectionBg` 추가
- [x] `parent/ReportViewer.tsx`: `#374151` → `colors.grey800`, `#4B5563` → `colors.grey700`, `#F0F9FF` → `colors.aiSectionBg`, `#1E40AF` → `colors.blue800`
- [x] `parent/ReactionForm.tsx`: `#374151`, `#EFF6FF`, `#6B7280` → 토큰화
- [x] `ops/BulkActionBar.tsx`: `#BFDBFE` → `colors.blue200`
- [x] `ops/ReportPreviewSheet.tsx`: `#F0F9FF`, `#1E40AF` → 토큰화
- [x] `survey/Step1Profile.tsx` ~ `Step4Health.tsx`: `#FFFFFF` → `colors.white`, `#F2F4F6` → `colors.surfaceTertiary`
- [x] `dog/DogPhotoPicker.tsx`: `#FFFFFF` → `colors.white`
- 결과: 전체 src/components/ hex 하드코딩 0건

### MSG-001 코드 연동
- [x] `lib/data/notificationTemplates.ts` 신규: `TEMPLATE_CODES.LOG_REMINDER` 상수 + `buildTemplate()` 헬퍼
- [x] `lib/hooks/useNotification.ts`: `useSendSmartMessage` mutation hook 추가

### B2B-001 추가 구현
- [x] `verify_parent_phone_last4` RPC DB 배포 (SECURITY DEFINER, anon/authenticated 권한)
- [x] `OpsList.tsx`: `initialNumToRender=10`, `updateCellsBatchingPeriod=50` 추가

### 검증
- tsc --noEmit: 0 에러 ✅
- hex 하드코딩 재스캔: 0건 ✅
- verify_parent_phone_last4 RPC DB 존재 확인 (prosecdef: true) ✅
