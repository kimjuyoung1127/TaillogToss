# AIT Private Standalone Launch Reclassification

Date: 2026-05-07 KST

## Scope

- Parity: `APP-001`, `REG-001`
- Skill: `toss-ait-build-ops`
- Goal: recover uploaded `.ait` private scheme launch and record the corrected standalone proof rule.

## Symptom

Uploaded artifact launched with:

```text
intoss-private://taillog-app?_deploymentId=019e005e-a79c-7ea7-93d4-d63e86fbbae6
```

Result: app did not reach usable UI. With Metro stopped, Android UI dump showed:

```text
앱 실행도중 문제가 발생했습니다.
앱인토스 개발자 커뮤니티로 문의해주세요.
```

## Initial Finding

Bundle scan showed the AIT runtime setup contained:

```text
brandIcon:"./src/assets/icons/app-logo-600.png"
```

This local project path is not resolvable by the standalone AIT host runtime.

## First Fix Attempt

`granite.config.ts` now reads `src/assets/icons/app-logo-600.png` at build time and passes a string data URI to `appsInToss({ brand.icon })`:

```text
brandIcon:"data:image/png;base64,...
```

## Build Evidence

| Item | Result |
|---|---|
| Command | `npm run build` |
| Build | RN 0.84.0 + RN 0.72.6, 0 errors, 0 warnings |
| Typecheck | `npx tsc --noEmit` PASS |
| Artifact | `taillog-app.ait` |
| Versioned artifact | `taillog-app-019e008c-d1e0-7148-bd63-cc61473c135f.ait` |
| SHA-256 | `dae63751b59bc11e3d8ba2b2fc29b4b41ee846a331b930f3b5fd4c7c4f39a562` |

## Launch Evidence

Test scheme:

```text
intoss-private://taillog-app?_deploymentId=019e008c-d1e0-7148-bd63-cc61473c135f
```

Result: user confirmed the uploaded artifact launches successfully.

## Reclassification

Later Metro-off controls showed that the earlier success was likely Metro-backed rather than standalone:

- Previous user-confirmed deployment `019e008c-d1e0-7148-bd63-cc61473c135f` shows the same host error when Metro is off.
- API-key deploy produced a fresh CLI URL, `intoss-private://taillog-app?_deploymentId=019e0160-42d7-72b2-b79a-806ee366eb31`.
- That fresh deployment still fails before JS with no `ReactNativeJS` marker in logcat.
- Console HTTPS logo URL was then applied and deployed as `019e018d-e9cc-7714-ba48-bb936ad4a6e2`; bundle scan confirmed `brandIcon:"https://static.toss.im/..."`, but Metro-off standalone still fails before JS.

Conclusion: local path and data URI were valid suspects, but HTTPS `brand.icon` did not resolve the standalone blocker. Treat the remaining issue as Apps in Toss test host deployment execution/compatibility and escalate with the latest deployment evidence.

## Durable Rule

Before uploading `.ait`, scan the bundle:

```bash
unzip -p taillog-app.ait bundle.android.0_84_0.js | rg 'brandIcon:"https://'
unzip -p taillog-app.ait bundle.android.0_84_0.js | rg 'brandIcon:"\./src/' && echo "BAD: local brand icon path leaked"
```

Standalone launch is not proven by Metro-backed rendering. Confirm with Metro off, the CLI/console-generated private scheme after upload, and a JS marker in logcat.
