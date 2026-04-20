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

## 검증

- tsc --noEmit: 0 에러
- 상태: Done (실기기 QA 미실시)
