# Prelaunch Blocker Scan

> Last Updated: 2026-05-12 KST  
> Scope: AUTH-001, APP-001, IAP-001, MSG-001, AD-001, B2B-001, REG-001  
> Source: `PROJECT-STATUS.md`, `11-FEATURE-PARITY-MATRIX.md`, `MISSING-AND-UNIMPLEMENTED.md`, `PROGRESS-CHECKLIST.md`, `AIT-DEPLOY-CHECKLIST.md`, code scan

## Gate Summary

| Area | Gate | Status | Release Meaning |
|---|---|---|---|
| Build/tests | TypeScript, app Jest, Edge Jest, Backend pytest | PASS | No local regression found in scan |
| App launch | AIT private standalone | PASS | Metro-off production Toss launch passed on 2026-05-11 |
| Icon/brand | 600x600 local logo + `brand.icon` | PARTIAL | Local icon assets are valid; `granite.config.ts` still points to console HTTPS icon, so a newly replaced icon needs console URL / config sync |
| IAP | SDK wrapper + grant completion | PARTIAL | Code path is implemented; final Sandbox success scenario still needs real-device evidence |
| Ads | SDK wrapper + live IDs + slot wiring | PARTIAL | Code path is implemented; supported-environment render success or no-fill final 판정 remains |
| Smart Message | log_reminder | PASS | Approved template + current-user HTTP 200 evidence exists |
| Auth | Toss Login bridge | PARTIAL | Existing Sandbox evidence exists; fresh authCode happy-path final evidence remains |
| B2B | B2C release impact | PARTIAL | B2C can proceed; B2B 40-dog perf/share-link/RPC endpoint remain follow-up |
| Console/publishing | QR/review button/business/customer support | BLOCKED | Manual console checks remain before submission |

## Remaining Release Blockers

1. IAP Sandbox final success evidence
   - Need: purchase success -> server grant -> `subscriptions.is_active=true` -> `completeProductGrant()` completed.
   - Existing: failure/recovery UI and SDK code path are implemented and tested.

2. QR test / review button activation
   - Need: Apps in Toss console QR test at least once and review request button enabled.
   - Existing: AIT private standalone launch passed in production Toss.

3. Console operations checks
   - Need: business category/service category match, customer support channel readiness, mTLS callback test button final 200, certificate expiry calendar.

4. New icon release sync
   - Need: after icon replacement, upload/approve the new console icon URL and update `granite.config.ts` `brandIcon` if the URL changes.
   - Local scan: `app-logo-600.png` and `app-logo-600-dark.png` are 600x600; `app-icon.png` is 1024x1024.

## Not Current Blockers After 2026-05-12 Scan

- Ads callback refactor: implemented via framework event callbacks.
- IAP `completeProductGrant()` missing: implemented in `src/lib/api/iap.ts`.
- Ads slot wiring: R2/B1/B2/B3/I1 wired.
- Live Ad Group ID fallback: implemented in `src/lib/ads/config.ts`.
- DevMenu / plan override leakage: gated by `isDevToolsEnabled()` requiring `__DEV__` and `EXPO_PUBLIC_SHOW_DEV_MENU=true`.
- Loopback backend URL: limited to DEV Metro host resolution; release defaults to Railway public URL.
- mTLS mock-mode doc drift: latest status says real mTLS for `verify-iap-order`, `send-smart-message`, and `grant-toss-points`.

## Validation

- `npm run typecheck` — PASS
- `npm run test:app -- --runInBand --passWithNoTests` — PASS, 16 suites / 101 tests
- `npm run test:edge -- --runInBand --passWithNoTests` — PASS, 13 suites / 45 tests
- `Backend/venv/bin/pytest Backend/tests/ -q` — PASS, 57 tests
- Code scan: `rg` for mock/TODO/loopback/external payment/icon/Ads/IAP/Smart Message consistency
