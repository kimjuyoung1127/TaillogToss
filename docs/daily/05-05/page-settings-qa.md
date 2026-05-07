# 2026-05-05 /settings QA

## Status: Done

작성 시각: 2026-05-05 23:30 KST
수정 시각: 2026-05-06 00:10 KST

## Scope

- Route: `/settings`
- Parity: `APP-001`
- Skills: `page-settings-upgrade`, `feature-data-binding-and-loading`, `feature-error-and-retry-state`

## Environment

| Item | Result |
|---|---|
| Metro | `http://localhost:8081/status` -> `packager-status:running` |
| FastAPI | `http://127.0.0.1:8765/health` -> `{"status":"ok"}` |
| Device | Android ADB `R3CXB0QH0LY` |
| Host | Toss Sandbox app `viva.republica.toss.test` |

## Functional QA

| Area | Check | Result | Evidence |
|---|---|---|---|
| Settings fetch | `/settings` renders live settings via `useUserSettings()` | PASS | `/tmp/taillog-settings-before.png` |
| Notification save | `푸시 알림` OFF -> saved -> ON restore | PASS | UI showed `23:28 저장됨`; DB restored to `{"push": true, "smart_message": true}` |
| AI persona save | `코칭 톤` 공감형 -> 솔루션형 -> 공감형 restore | PASS | DB changed to `{"tone":"solution"}` then restored to `{"tone":"empathetic","perspective":"coach"}` |
| Device permission | `기기 설정 열기` uses `Linking.openSettings()` | PASS | Duplicate service row removed; banner remains as the single device-settings entry |
| Navigation | 구독/약관/개인정보/프로필/내 반려견 rows are wired | PASS by code | `내 반려견` now routes to `/dog/switcher` |

## Usefulness / Duplication Findings

| Priority | Item | Finding | Recommendation |
|---|---|---|---|
| P1 | `AI 코칭` tone/perspective | Settings are stored and now consumed by backend coaching prompt generation. | DONE: `ai_persona` is passed into generated reports and Pro ask-coach context. |
| P1 | Notification type toggles | `coaching_ready`, `training_reminder`, `surge_alert`, `promo` settings are stored, but official docs still mark several Smart Message campaigns as console registration pending. | REMAINING: Add status copy per row or disable pending campaign toggles until console setup is complete. |
| P2 | `프로필 편집` vs `내 반려견` | Both used to navigate to `/dog/profile`. | DONE: `프로필 편집` remains `/dog/profile`; `내 반려견` now opens `/dog/switcher`. |
| P2 | `기기 설정 열기` banner vs `기기 알림 권한` row | Both called `Linking.openSettings()`. | DONE: Removed duplicate service row and kept the permission banner. |
| P3 | Hardcoded version | `v0.1.0` is hardcoded in page UI. | Read from package/build metadata before release. |

## Componentization Review

| Check | Result |
|---|---|
| Row/card primitives | GOOD: `SettingsSectionCard`, `SettingsToggleRow`, `SettingsNavRow`, `SettingsStatusRow`, `SettingsStepperRow` are cleanly separated. |
| Loading/error states | GOOD: `SettingsScreenSkeleton`, `SettingsScreenError` are route-scoped and reusable enough. |
| Page size | IMPROVED: `src/pages/settings/index.tsx` was reduced from 460 to 369 lines by extracting route sections. |
| Section split | DONE: `NotificationSettingsSection`, `AiCoachingSettingsSection`, `AccountSettingsSection`, `ServiceSettingsSection` now own section rendering; `SettingsDivider` removes repeated row divider styles. |

## Mock / Real Binding Verdict

- Real: Settings fetch/update persists through FastAPI/Supabase and DB was verified after ADB toggles.
- Partial: Smart Message-related toggles are preferences only until each campaign is registered/approved.
- Real: AI persona is persisted and reflected in backend AI coaching prompt generation.
- Not mock: No hardcoded local mock data was found in `/settings` main page.

## Validation

- ADB screenshot: `/tmp/taillog-settings-before.png`
- ADB screenshot: `/tmp/taillog-settings-lower.png`
- ADB screenshot: `/tmp/taillog-settings-toggle-push.png`
- DB verification: latest `user_settings` row updated at `2026-05-05 23:29:15 KST`
- Frontend typecheck: `npm run typecheck` PASS
- Frontend/Edge Jest: `npm test -- --runInBand` PASS (24 suites / 128 tests)
- Backend pytest: `cd Backend && venv/bin/pytest tests/ -q` PASS (47 tests)
- Backend prompt unit: `Backend/tests/test_coaching_prompts.py` PASS

## Re-test 2026-05-05 23:59 KST

| Check | Result | Evidence |
|---|---|---|
| Full frontend typecheck | PASS | `npm run typecheck` |
| Frontend + Edge Jest | PASS | 24 suites / 128 tests |
| Backend pytest | PASS | 47 tests |
| Metro + FastAPI health | PASS | `packager-status:running`, `{"status":"ok"}` |
| `/settings` deep link render | PASS | `/tmp/taillog-settings-after-test.png`; no ReactNativeJS/AndroidRuntime error in recent logcat |
| Push notification toggle save | PASS | OFF saved to DB, then restored ON; `/tmp/taillog-settings-toggle-test-off.png`, `/tmp/taillog-settings-toggle-test-restored.png` |
| Lower settings layout | PASS | duplicate `기기 알림 권한` service row absent; `/tmp/taillog-settings-service-after-test.png` |
| `내 반려견` navigation | PASS | opens dog switcher sheet; `/tmp/taillog-settings-dog-switcher-nav.png` |

## Next Actions

1. Smart Message 콘솔 등록/승인 완료 후 알림 타입별 happy-path를 재검증한다.
2. 설정 컨트롤러 훅 분리는 다음 설정 기능이 늘어날 때 진행한다.

## Follow-up 2026-05-06

- DONE: `v0.1.0` 하드코딩을 `package.json` 기반 `APP_VERSION_LABEL` 표시로 교체했다.
