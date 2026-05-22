# /dashboard — PRO 광고 배너 깜빡임 점검

Date: 2026-05-22 KST

## Scope
- [x] UIUX-001 `/dashboard`
- [x] AD-001 B1 dashboard banner gating
- [x] IAP-001 B2C subscription entitlement read

## Findings
- [x] PRO 사용자가 `/dashboard` 진입 시 구독 조회가 끝나기 전 `useIsPro()` 결과가 falsy로 흐르며 B1 배너가 먼저 마운트될 수 있는 경로 확인.
- [x] React Query persistence 정책에서 `subscription`은 의도적으로 제외되어 앱 재진입 시 구독 상태가 네트워크 응답 전까지 비어 있을 수 있음.

## Change
- [x] `useProStatus()` 추가: 기존 `useIsPro()` 호환 유지 + entitlement 조회 완료 여부 제공.
- [x] `/dashboard` B1 배너 조건을 `isEntitlementResolved && !isPro`로 변경해 구독 조회 성공 전 광고 SDK 마운트 차단.

## Validation
- [x] `npx tsc --noEmit` PASS
- [x] `npx jest src/lib/hooks/__tests__/usePageGuard.test.ts src/lib/api/__tests__/queryPersistence.test.ts --runInBand --passWithNoTests` PASS
- [x] AIT `019e4e15-2489-7f1a-9a82-092ab1e56fa4` actual Toss Metro-off `/dashboard` 렌더 PASS, 화면상 B1 광고 배너 미노출 확인

## Board Sync
- [x] `docs/status/PAGE-UPGRADE-BOARD.md` `/dashboard` remains `QA`, `last_updated=2026-05-22`

## Risks
- [x] 실기기 PRO 계정에서 B1 배너 화면 미노출 확인 완료.
- [ ] 광고 SDK 무마운트 로그까지 필요하면 별도 tracker 필터로 재수집.
