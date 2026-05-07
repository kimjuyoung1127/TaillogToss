# 2026-05-06 /settings

## Status: Done

## Scope

- Route: `/settings`
- Parity: `APP-001`

## Fixes

- 설정 화면 하단 버전 표시의 `v0.1.0` 하드코딩을 제거했다.
- `src/lib/appInfo.ts`에서 `package.json`의 `version`을 읽어 `APP_VERSION_LABEL`로 표시한다.

## Validation

- `npm run typecheck` PASS
- `npm test -- --runInBand` PASS: app 13 suites / 87 tests, edge 13 suites / 45 tests
- `cd Backend && venv/bin/pytest tests/ -q` PASS: 47 tests

## Remaining

- Smart Message 콘솔 등록/승인 완료 후 알림 타입별 happy-path를 재검증한다.
- 설정 컨트롤러 훅 분리는 다음 설정 기능이 늘어날 때 진행한다.
