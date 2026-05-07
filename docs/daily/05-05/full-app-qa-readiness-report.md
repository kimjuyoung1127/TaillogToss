# 2026-05-05 Full App QA Readiness Report

## Status: Executed

작성 시각: 2026-05-05 18:35:12 KST
실행 업데이트: 2026-05-05 19:12 KST

## Scope

- Parity: AUTH-001, APP-001, UI-001, LOG-001, AI-001, IAP-001, MSG-001, AD-001, B2B-001, REG-001
- Route inventory: `src/pages/**`, `pages/**`, `src/components/shared/DevMenu.tsx`, `docs/status/PAGE-UPGRADE-BOARD.md`
- Backend inventory: `Backend/app/features/**/router.py`
- Edge inventory: `supabase/functions/*`
- Skill inventory: `.claude/skills/**/SKILL.md` (`_backup` 제외)
- Mode: 최초 보고 후 owner가 무개입 진행 승인. 코드 수정, Supabase CLI 배포, 실기기 QA, 문서 동기화까지 실행.

## Readiness Summary

| Area | Result | Notes |
|---|---|---|
| Skill inventory | PARTIAL | 활성 `SKILL.md` 43개 확인. Codex는 Claude skill을 실행하지 않고 파일 절차로 읽어 사용할 수 있음. |
| Docs/harness | PARTIAL | `.claude/commands`, `.claude/hooks`, `.claude/automations` 존재. `AGENTS.md`는 slim 규칙과 현재 장문 컨텍스트 맵이 충돌. |
| Supabase CLI | PASS | CLI 2.84.2 로그인/프로젝트 링크 확인. Linked project: `gxvtgrcqkbdibkyeqyil` (`tosstaillog`). |
| ADB | PASS | `adb devices`에서 `R3CXB0QH0LY device` 확인. |
| Metro | PASS | `http://localhost:8081/status` -> `packager-status:running`. |
| FastAPI | PARTIAL | `http://localhost:8765/health` -> `{"status":"ok"}`. `8000/health`는 연결 실패. 스킬/문서의 8000/8765 포트 기준 정렬 필요. |
| TypeScript | PASS | `npm run typecheck` 성공. |
| Backend pytest | PASS | `Backend/venv/bin/pytest Backend/tests -q` -> 46 passed. |
| App Jest | PASS | IAP native module Jest mock 추가 후 11 suites/83 tests PASS. |
| Edge Jest | PASS | `npm run test:edge` -> 13 suites/45 tests PASS. |

## Executed Fixes (2026-05-05)

| Area | Parity | Change | Result |
|---|---|---|---|
| Subscription API | IAP-001 | `Backend/app/features/subscription/router.py` Pydantic 응답 타입을 실제 `date/datetime` 값과 맞춤 | 실기기 `/settings/subscription` 진입 시 500 재현 후 200으로 회복 |
| IAP Jest harness | IAP-001 | `@apps-in-toss/native-modules` Jest mock 추가 | `npm test` 전체 통과 |
| Supabase Edge drift | MSG-001, B2B-001 | `send-smart-message`, `grant-toss-points`, `generate-report`를 Supabase CLI로 원격 배포 | `supabase functions list`에서 9개 ACTIVE 확인 |
| Root/404 routing | APP-001 | 인증/온보딩 상태 기반으로 `/dashboard` 또는 `/onboarding/welcome` 리다이렉트 | 실기기에서 `_404` 대기 화면 고착 후 대시보드/훈련 복귀 확인 |
| Icon cleanup phase 1 | UI-001, AI-001, IAP-001 | Pro sheet, training recommendation, dashboard chart link, coaching analysis badge의 텍스트 이모지를 기존 custom asset으로 교체 | 실기기 훈련 화면 재확인 |
| Dev QA ergonomics | UI-001 | DevMenu FAB 크기/투명도 축소 | 긴 문서/빠른 기록/훈련 화면 가림 영향 완화 |

## Device QA Evidence

| Flow | Evidence | Backend |
|---|---|---|
| Launch via Toss Sandbox scheme | `adb shell am start -a android.intent.action.VIEW -d 'intoss://taillog-app/' viva.republica.toss.test` | Metro 8081 + FastAPI 8765 |
| Dashboard | `/tmp/taillog-current.png`, `/tmp/taillog-after-root-fix.png` | `/api/v1/dashboard/` 200, `/api/v1/coaching/usage/daily` 200 |
| Subscription | `/tmp/taillog-subscription.png` | `/api/v1/subscription/` 200 after schema fix |
| Training academy | `/tmp/taillog-after-root-fix-training.png` | `/api/v1/training/*` 200, behavior analytics 200 |
| Quick log | `/tmp/taillog-quicklog.png` | no save mutation executed to avoid creating fake production data |

## Official Docs Baseline

- 앱인토스 React Native: `https://developers-apps-in-toss.toss.im/tutorials/react-native.html`
- 미니앱 가이드라인: `https://developers-apps-in-toss.toss.im/checklist/miniapp-service.html`
- 토스 로그인: `https://developers-apps-in-toss.toss.im/development/toss-login.html`
- IAP 개발: `https://developers-apps-in-toss.toss.im/iap/develop.html`
- IAP SDK reference: `https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%9D%B8%EC%95%B1%20%EA%B2%B0%EC%A0%9C/IAP.html`
- TDS: `https://developers-apps-in-toss.toss.im/design/components.html`
- 그래픽 리소스: `https://developers-apps-in-toss.toss.im/design/resources.html`

비교 기준:
- 토스 로그인은 미니앱에서 필수 로그인 방식이며 `appLogin` 인가코드, `referrer`, 서버 token exchange 증적이 필요함.
- IAP는 지원 앱 버전 및 `createOneTimePurchaseOrder`, 지급 완료 후 `completeProductGrant` 플로우 증적이 필요함.
- 그래픽 리소스는 화면 UI 용도 제한이 있으므로 앱 로고/썸네일에는 자체 제작 커스텀 아이콘을 사용해야 함.

## High Findings

| Priority | Finding | Evidence | Impact | Approval Action |
|---|---|---|---|---|
| RESOLVED | App Jest 전체 실행이 IAP 네이티브 모듈 import에서 중단 | `src/lib/api/__tests__/iap.test.ts`에 native module mock 추가 | CI/로컬 회귀 테스트 복구 | `npm test` PASS |
| RESOLVED | 원격 Supabase Edge 배포 목록과 로컬/문서 목록 불일치 | Supabase CLI 배포 후 `send-smart-message`, `grant-toss-points`, `generate-report` ACTIVE | 원격 함수 누락 위험 해소 | secrets/real-mode 검증은 별도 |
| HIGH | `generate-report` 기본 AI 모드가 mock이고 원격 secrets에 OpenAI/REPORT 키 없음 | `supabase/functions/generate-report/index.ts:59`, `supabase secrets list`에 `OPENAI_API_KEY`, `REPORT_AI_MODE` 없음 | B2B 리포트가 실제 AI 요약이 아니라 규칙 기반 mock으로 생성될 수 있음 | 실 AI 사용 여부 결정 후 secrets 등록/배포 또는 UI에 beta/mock 표시 |
| HIGH | 광고 SDK가 env 미설정 시 테스트 ID 및 mock preview로 fallback | `src/lib/ads/config.ts:11-30`, `src/components/shared/ads/BannerAd.tsx:33-40` | env 누락 빌드에서 사용자는 실제 광고 대신 `[광고 미리보기]`를 볼 수 있음 | release build에서 test id 차단 assertion 추가 |
| HIGH | DevMenu mock login/guard bypass/plan override가 강력함 | `src/components/shared/DevMenu.tsx:85-172` | `__DEV__` 전용 의도지만 release 번들 제거 증적 없으면 인증/구독/역할 QA가 왜곡됨 | production build에서 DevMenu 미포함 스냅샷/grep 검증 추가 |

## Medium Findings

| Priority | Finding | Evidence | Impact | Approval Action |
|---|---|---|---|---|
| MED | route source drift | `DevMenu` 20 routes vs `src/pages` 28 routes. DevMenu에 `/onboarding/stage1-form`, `/stage2-form`, `/stage3-form`, `/ops/setup`, `/ops/dog-add`, `/report/[shareToken]` 없음 | 관리 라우트 기준 QA에서 실제 화면 일부 누락 | DevMenu 또는 route inventory script를 단일 기준으로 정렬 |
| MED | Page board references missing page skills | `PAGE-UPGRADE-BOARD.md` references `page-ops-setup-upgrade`, `page-ops-dog-add-upgrade`; `.claude/skills/page-skills/page/ops`에는 settings/today만 있음 | goal 실행 시 해당 page skill 로드 실패 | 누락 스킬 생성 또는 board의 skill 값을 `—`로 정정 |
| MED | `AGENTS.md` slim rule conflict | 현재 `AGENTS.md`에 긴 Codex Context Map이 추가됨. 같은 파일 규칙 6은 slim 유지 | nightly slimming 또는 에이전트 간 규칙 충돌 | 긴 컨텍스트 맵을 `docs/ref/CODEX-CONTEXT-MAP.md`로 분리하고 AGENTS는 pointer만 유지 |
| MED | IAP dev direct grant button exists | `src/pages/settings/subscription.tsx:86-109`, `__DEV__` guarded | 개발 편의로 유용하나 실기기 Sandbox 결제 UX를 우회할 수 있음 | QA 시 dev bypass 사용 금지 체크리스트 추가 |
| RESOLVED | Root/404 loading text is generic English and can stick on back-stack restore | `src/pages/index.tsx`, `src/pages/_404.tsx` | 한국어 전환 문구 + 인증 상태 기반 리다이렉트로 수정 | 실기기 재현 화면에서 대시보드/훈련 복귀 확인 |

## Mock / Unimplemented Candidates

| File | Pattern | Production Concern | Difficulty |
|---|---|---|---|
| `supabase/functions/generate-report/index.ts` | `REPORT_AI_MODE` default `mock`, `mock_rule_v1` | B2B 리포트 AI 품질/과금/실키 검증 미완 | M |
| `src/lib/ads/config.ts` | `ait-ad-test-*`, `createMockAdsSdk()` | 광고 수익화/노출 검증이 test id에 묶임 | M |
| `src/components/shared/ads/BannerAd.tsx` | `[광고 미리보기]` | release env 누락 시 사용자 노출 위험 | S |
| `src/components/shared/DevMenu.tsx` | mock login, guard bypass, plan override | QA 왜곡/릴리즈 포함 여부 증적 필요 | M |
| `src/pages/settings/subscription.tsx` | `[DEV] IAP 바이패스` | 결제 UI 3시나리오 검증을 우회할 수 있음 | S |
| `src/pages/ops/dog-add.tsx` | `TODO: DB migration 후 저장` | 의료 정보 입력값 일부 미저장 가능성 | M |
| `src/lib/api/report.ts` | `crypto.randomUUID()` share token client generation | 보안/충돌 가능성은 낮지만 서버 발급형이 더 안전 | M |
| `supabase/functions/_shared/mTLSClient.ts` | `MockMTLSClient`, `mock_stable_user_001` | mock 모드로 배포되면 Toss identity가 고정됨 | M |

## Icon Replacement Candidates

| File | Current | Meaning | Existing Asset Candidate | Need Imagegen |
|---|---|---|---|---|
| `src/components/features/training/ProUpgradeSheet.tsx` | `📊 🔇 📋 💬 🎮` | Pro benefits | `ic-analysis`, `ic-report`, `ic-training`; missing ad-free/chat/game-plan variants | Yes |
| `src/pages/settings/subscription.tsx` | `🤖 📅` plus mixed custom icons | Pro feature list | `ic-coaching`, `ic-training` | Maybe |
| `src/components/shared/DevMenu.tsx` | `🔐 🔓 🔒 💎 🆓 📱` | dev controls | dev-only, can leave or replace with text/icon asset | Low |
| `src/pages/onboarding/stage1-form.tsx` | `🐶 🌸 ✅ ❌` | sex/neuter choices | `ic-dog`, custom female/neuter icons needed | Yes |
| `src/pages/onboarding/stage2-form.tsx` | many emoji chips | environment/problem choices | category icons partially exist | Yes |
| `src/pages/onboarding/stage3-form.tsx` | reaction/energy emoji chips | advanced profiling | custom reaction/energy icon set needed | Yes |
| `src/pages/dashboard/index.tsx` | `📊` chart link | analytics navigation | `ic-analysis` | Done |
| `src/components/features/coaching/*` | `📈 ➡️ ⚠️` trend/status | coaching trend | trend up/steady/warning icons needed | Yes |
| `src/pages/report/[shareToken].tsx` | lock emoji via unicode | public report auth | custom lock icon or TDS icon | Maybe |

Existing custom asset base:
- `src/assets/icons/` has app icon/logo, nav icons, category icons, badges, empty illustrations.
- Runtime source is `src/lib/data/iconSources.ts` base64 URI.
- Asset guide says new icons should be added as PNG `@2x/@3x`, then `scripts/generate_custom_icons.py` should regenerate `iconSources.ts`.

## UX Notes

| Route / Area | Score | Notes |
|---|---:|---|
| `/settings` | 4/5 | Real backend-first settings API with skeleton/error/save state. Good. Risk: settings has many toggles for Smart Message types whose campaigns are not all registered. |
| `/settings/subscription` | 3/5 | Loading/error exists. IAP flow has real wrapper, but dev bypass and Jest native module issue reduce QA confidence. |
| `/dashboard/analysis` | 4/5 | Loading/empty/error states present and useful. Needs 실기기 visual QA for chart/webview/ad interaction. |
| `/training/detail` | 4/5 | Skeleton/error/empty present. Needs icon cleanup and real device attempt history visual pass. |
| `/parent/reports` and `/report/[shareToken]` | 3/5 | Public share flow exists with RPC verification. Needs B2B share-link 실기기 and `verify_parent_phone_last4` remote availability proof. |
| Root/404 | 4/5 | 한국어 fallback + 인증 상태 기반 리다이렉트 적용. 실기기에서 대기 화면 고착 재검증 통과. |

## Real-Run QA Plan After Approval

1. Fix test harness first: mock/lazy-load `@apps-in-toss/native-modules` so `npm test` runs app + edge in one command.
2. Align Supabase remote functions: confirm whether `send-smart-message`, `grant-toss-points`, `generate-report` should be deployed to `gxvtgrcqkbdibkyeqyil`.
3. Run device QA with no dev bypass:
   - `adb reverse tcp:8081 tcp:8081`
   - use current backend port `8765` or normalize docs/skill to `8000`
   - launch `intoss://taillog-app`
   - capture AUTH fresh code, route sweep, IAP purchase/recover/fail, MSG, AD, share link.
4. Produce icon replacement batch:
   - start with ProUpgradeSheet, subscription features, onboarding chips, coaching trend/status.
   - generate new PNG set with imagegen using existing `src/assets/icons/app-icon.png` and `app-logo-600.png` as style anchors.
   - regenerate `src/lib/data/iconSources.ts`.

## Docs Sync Candidates

No status board was changed in this report-only pass. Suggested updates after owner approval:

- `docs/status/MISSING-AND-UNIMPLEMENTED.md`
  - add remote Edge drift: `send-smart-message`, `grant-toss-points`, `generate-report` not listed by `supabase functions list`.
  - add Jest IAP native module harness blocker.
  - update old mTLS/mock rows that conflict with current `PROJECT-STATUS.md`.
- `docs/status/PAGE-UPGRADE-BOARD.md`
  - fix missing page skills for `/ops/setup`, `/ops/dog-add`.
  - add route inventory drift note for DevMenu.
- `AGENTS.md`
  - move long Codex context map into `docs/ref/CODEX-CONTEXT-MAP.md`, leave pointer only.

## Validation Log

- `find .claude/skills -path '*/_backup/*' -prune -o -type f -name 'SKILL.md' -print | wc -l` -> 43
- `supabase --version` -> 2.84.2
- `supabase projects list` -> linked `gxvtgrcqkbdibkyeqyil`
- `supabase functions list` -> 9 remote functions listed (`send-smart-message`, `grant-toss-points`, `generate-report` ACTIVE)
- `supabase secrets list` -> Toss/Supabase secrets present; OpenAI/report mode names absent
- `adb devices` -> `R3CXB0QH0LY device`
- `curl http://localhost:8081/status` -> `packager-status:running`
- `curl http://localhost:8000/health` -> connection failed
- `curl http://localhost:8765/health` -> `{"status":"ok"}`
- `npm run typecheck` -> PASS after fixes
- `Backend/venv/bin/pytest Backend/tests -q` -> 46 passed
- `npm test -- --runInBand` -> app 83 passed + edge 45 passed
- `supabase functions deploy send-smart-message grant-toss-points generate-report` -> deployed to `gxvtgrcqkbdibkyeqyil`

## Next Recommendations

1. `REPORT_AI_MODE=real` + `OPENAI_API_KEY` 운영 여부를 결정하고 `generate-report` 실모드 검증을 분리 실행.
2. Toss mTLS 인증서/실 AdGroup ID 확보 후 `TOSS_MTLS_MODE=real`, Ads Sandbox 실노출, Smart Message 실발송을 검증.
3. Imagegen 기반 커스텀 아이콘 2차: onboarding chips, coaching trend/status, ad-free/chat/game-plan 전용 아이콘 제작.
