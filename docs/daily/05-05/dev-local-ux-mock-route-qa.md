# 2026-05-05 DEV_LOCAL UX / Mock / Route QA

## Status: P0/P1 Fixes Applied

작성 시각: 2026-05-05 20:55 KST

## Scope

- Runtime: `DEV_LOCAL`
- Parity: `APP-001`, `IAP-001`, `UIUX-004`, `UIUX-005`, `B2B-001`
- Safety: 실결제, Smart Message 실발송, Ads 실노출, 프로덕션 배포 미실행

## Environment

| Item | Result |
|---|---|
| Metro | `http://localhost:8081/status` -> `packager-status:running` |
| FastAPI | `http://localhost:8765/health` -> `{"status":"ok"}` |
| Device | Android ADB `R3CXB0QH0LY` |
| Host | Toss Sandbox app `viva.republica.toss.test` |

## 1. Subscription Flow

Live route:

```text
intoss://taillog-app/settings/subscription
```

Evidence:

| Check | Evidence | Result |
|---|---|---|
| Screenshot | `/tmp/taillog-subscription-dev-qa.png` | PASS |
| Current plan | `PRO` badge visible | PASS |
| Billing date | `2026-06-03` visible | PASS |
| Token products | 10회 `₩1,892`, 30회 `₩3,498` visible | PASS |
| Restore entry | `구매 내역 복원` visible | PASS |

Notes:

- `src/pages/settings/subscription.tsx` has a DEV-only direct grant button behind `__DEV__`.
- `useIsPro()` supports `devPlanOverride`; this is useful for UX QA but must not be counted as release evidence.
- `restoreSubscription()` currently returns DB subscription state because Toss IAP restore API is still blocked.

## 2. Settings Mock / DB Binding Check

Live route:

```text
intoss://taillog-app/settings
```

Evidence:

| Check | Evidence | Result |
|---|---|---|
| Screenshot | `/tmp/taillog-settings-dev-qa.png` | PASS |
| Settings fetch | `useUserSettings()` -> `getSettings()` -> FastAPI/Supabase fallback | Connected |
| Settings save | `useUpdateSettings()` -> `updateSettings()` | Connected |
| Notification toggles | push/smart/log/surge/coaching/training/promo | Connected to `notification_pref` |
| AI coaching tone/perspective | `ai_persona` update | Connected |

Findings:

| Priority | File | Finding | Impact |
|---|---|---|---|
| High | `src/pages/settings/index.tsx` | `프로필 편집` and `내 반려견` both navigate to `/dog/profile`, but `/dog/profile` currently crashes | Settings account/service paths can lead to a hard render error |
| Medium | `src/pages/settings/index.tsx` | `v0.1.0` is hardcoded | Release version display can drift from package/build metadata |
| Low | `src/pages/settings/index.tsx` | `기기 알림 권한` opens device settings directly | Acceptable, but no in-app permission status feedback beyond external settings |

## 3. Onboarding / Coaching Icon Gap

Summary:

- `onboarding/welcome`, `CoachingGenerationLoader`, `AnalysisBadge`, and parts of `FreeBlock` already use custom image assets.
- Many onboarding form chips and coaching locked/error/trend surfaces still use text emoji.

Representative remaining emoji targets:

| Priority | Area | Files / examples | Recommendation |
|---|---|---|---|
| High | Onboarding stage 2/3 chips | `src/pages/onboarding/stage2-form.tsx`, `src/pages/onboarding/stage3-form.tsx` | Replace category-leading emoji in selectable chips with custom icon set |
| High | Coaching locked / trend states | `src/components/features/coaching/LockedBlock.tsx`, `FreeBlock.tsx`, `CoachingDetailContent.tsx` | Replace trend/risk/lock/specialist emoji with `ICONS` image assets |
| Medium | Notification page | `src/pages/onboarding/notification.tsx` | Replace bell/close text glyphs with image/icon assets |
| Medium | Survey legacy components | `src/components/features/survey/Step3Goal.tsx`, `Step4Health.tsx`, `Stage2InterceptModal.tsx` | Migrate remaining reward/health/paw/check emoji |
| Low | Rating stars/checkmarks | coaching feedback stars, checkmarks | Can remain text if intentionally semantic and visually stable |

## 4. Route Sweep

Method:

- Launched routes with `adb shell am start -a android.intent.action.VIEW -d intoss://taillog-app/<route>`.
- Captured UI text via `uiautomator dump`.
- Spot screenshots captured for subscription/settings/coaching/parent reports and known error states.

Key pass cases:

| Route | Result |
|---|---|
| `/settings/subscription` | PASS: renders PRO state |
| `/settings` | PASS: renders settings and DB-bound toggles |
| `/coaching/result` | PASS after clean force-stop: renders AI behavior diagnosis |
| `/parent/reports` | PASS after clean force-stop: renders empty state |
| `/dashboard`, `/dashboard/analysis`, `/training/academy`, legal routes | PASS |

Findings:

| Priority | Route | Evidence | Root cause candidate |
|---|---|---|---|
| P0 | `/dog/profile` | Render error: `undefined is not a function` at `profile.tsx:265`, `triggers.includes(...)` | `dogEnv.triggers` can be non-array/null in live DB shape; normalize before `setTriggers()` |
| P1 | `/report/test-share-token` | Render error: `Cannot access parameters from route '/report/[shareToken]' in current route '/report/:shareToken'` | Dynamic route name mismatch between file route and runtime normalized route |
| P1 | `/onboarding/stage2-form` | Title: `undefined에 대해 더 알려줘요` | Direct entry without `dogName` param needs fallback/guard |
| P1 | `/onboarding/stage3-form` | Title: `undefined의 기질과 건강` | Direct entry without `dogName` param needs fallback/guard |
| P2 | `/training/detail` | `커리큘럼을 찾을 수 없어요` on direct entry | Expected if no `curriculum_id`, but should guide back to academy |
| Info | `/ops/*` routes | B2C user redirects to dashboard | Expected role guard behavior |

Error screenshots:

| Route | Screenshot |
|---|---|
| `/dog/profile` | `/tmp/taillog-route-dog-profile-error.png` |
| `/report/test-share-token` | `/tmp/taillog-route-report-error.png` |

## 5. Recommended Fix Order

1. P0: Fix `/dog/profile` trigger normalization because Settings links can crash. — DONE
2. P1: Fix `/report/[shareToken]` dynamic route param access. — DONE
3. P1: Add direct-entry fallback/guard for onboarding stage2/stage3 `dogName`. — DONE
4. P1: Start icon replacement with onboarding stage2/stage3 chips and coaching locked/trend surfaces.
5. P2: Improve `/training/detail` no-param empty state CTA.
6. DONE 2026-05-07: `granite.config.ts` `brand.icon` now uses build-time PNG data URI; rebuilt/uploaded `.ait` (`019e008c-d1e0-7148-bd63-cc61473c135f`) runs successfully.

## Fix Follow-up

Applied after owner approval:

| Route | Fix | Validation |
|---|---|---|
| `/dog/profile` | Normalize `dogEnv.triggers` when live DB returns non-array JSON shape | `intoss://taillog-app/dog/profile` renders profile form; screenshot `/tmp/taillog-route-dog-profile-fixed.png` |
| `/report/[shareToken]` | Read raw React Navigation params to avoid Granite bracket/colon strict mismatch | `intoss://taillog-app/report/test-share-token` renders "리포트를 찾을 수 없어요" instead of render error; screenshot `/tmp/taillog-route-report-fixed.png` |
| `/onboarding/stage2-form` | Use `activeDog` fallback for direct entry and guard submit when dog id is absent | Direct entry title changed from `undefined...` to `메이...` |
| `/onboarding/stage3-form` | Use `activeDog` fallback for direct entry and guard submit when dog id is absent | Direct entry title changed from `undefined...` to `메이...` |

Validation commands:

```bash
npm run typecheck
npm test -- --runInBand
```

Results:

- TypeScript: PASS
- Jest app: 11 suites / 83 tests PASS
- Jest edge: 13 suites / 45 tests PASS
- DEV_LOCAL restored to `/dashboard`; screenshot `/tmp/taillog-dashboard-restored-after-fixes.png`
