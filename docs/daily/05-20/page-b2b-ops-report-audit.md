# 2026-05-20 B2B Ops / Report Audit

Scope: `B2B-001`

## Findings

- [x] `/ops/today` 개별 기록 모달 SafeArea/keyboard gap 확인.
  - B2C `/dashboard/quick-log` 정상 패턴은 `SafeAreaView` + `KeyboardAvoidingView` + 입력 focus 시 scroll 보정.
  - B2B `RecordModal`은 RN `Modal` 내부 별도 native window인데 `SafeAreaProvider`/insets가 없고 footer가 하단 시스템 영역을 고려하지 않았음.
- [x] 즉시 패치.
  - `src/components/features/ops/RecordModal.tsx`: `SafeAreaProvider`, `useSafeAreaInsets`, `KeyboardAvoidingView`, `keyboardShouldPersistTaps`, memo focus scroll, footer bottom inset 적용.
  - `src/components/features/ops/ReportPreviewSheet.tsx`: 동일 패턴 적용.
- [x] 리포트 발송 기능 확인.
  - FE `sendReport()`와 BE `send_report()`는 `share_token`, `sent_at`, `expires_at`, `generation_status=sent`만 갱신.
  - 실제 Toss `getTossShareLink`, Smart Message, SMS/Alimtalk, Clipboard/ShareSheet 호출은 없음.
  - `ReportPreviewSheet`의 “공유 링크”는 실제 공유 URL 생성이 아니라 path 문자열 표시 수준.
- [x] 리포트 생성 기능 확인.
  - FastAPI `/api/v1/report/`는 `generation_status=pending` 빈 row 생성까지만 수행.
  - `supabase/functions/generate-report` Edge는 mock/real 생성 로직이 있으나 현재 FE/BE 생성 플로우와 직접 연결되어 있지 않음.
- [x] 내보내기 확인.
  - CSV/PDF/export 기능은 코드상 확인되지 않음. `MISSING-AND-UNIMPLEMENTED.md`에도 데이터 내보내기가 미구현/V2 후보로 남아 있음.
- [x] 로고 확인.
  - 스키마/타입/응답에는 `organizations.logo_url`이 있으나 `/ops/setup`, `/ops/settings`, `OrgInfoEditForm`, `updateOrg` UI/API 흐름에서 업로드/수정/표시가 없음.

## Schema Review

- `daily_reports`는 `share_token`, `toss_share_url`, `expires_at`, `sent_at`, `highlight_photo_urls`, AI 요약 필드를 갖고 있어 보호자 공유/발송/리포트 표시를 감당할 수 있음.
- `organizations.logo_url`도 있어 센터 로고 저장 구조는 있음.
- CSV/PDF 내보내기를 “즉시 생성 다운로드”로만 처리하면 현재 스키마로 가능하지만, 파일 보관/감사/재다운로드까지 요구하면 `report_exports` 같은 별도 테이블 또는 Storage object metadata가 필요함.

## Validation

- `npx tsc --noEmit` PASS
- `git diff --check -- src/components/features/ops/RecordModal.tsx src/components/features/ops/ReportPreviewSheet.tsx` PASS

## Implementation Update — Report Generation / Share / Org Logo

- [x] 리포트 생성 연결.
  - `src/lib/api/report.ts`: FastAPI `/api/v1/report/` pending row 생성 후 Supabase Edge `generate-report` invoke로 AI 요약 생성까지 연결.
  - `supabase/functions/_shared/httpAdapter.ts`: B2B 역할이 들어가는 `user_metadata.role`도 Edge role 후보로 읽도록 보강.
  - `/ops/today`: 센터 리포트 생성은 `created_by_org_id`만 넘기도록 조정해 `daily_reports` XOR 제약 충돌을 피함.
- [x] 리포트 공유 연결.
  - `getTossShareLink('intoss://taillog-app/parent/reports?token=...')`로 Toss 공유 링크를 만들고 `daily_reports.toss_share_url`에 저장.
  - 저장 후 `share({ message })`로 OS 공유시트를 여는 CTA로 변경. Smart Message는 템플릿/비용/수신자 정책 확정 전까지 제외.
  - `ReportPreviewSheet` 문구를 “발송”에서 “공유”로 바꾸고 저장된 Toss 링크를 표시.
- [x] 센터 로고.
  - `/ops/settings`에 현재 로고 표시, 편집 중 사진 선택, 업로드 후 `organizations.logo_url` 저장 흐름 추가.
  - `src/components/shared/PhotoPicker.tsx`와 `src/lib/api/storageImage.ts`로 Dog/Org 사진 선택·업로드 공통화를 적용.
  - `supabase/migrations/20260520000300_org_logos_storage_policies.sql` 추가: public `org-logos` bucket + owner-folder RLS.
- [x] 스킬 정합성.
  - `.agents/skills/toss-guide/ops/toss-dev-server/SKILL.md`: FastAPI 포트를 현재 코드 기준 `8765`로 수정하고 `8081/5173/8765` reverse를 표준화.
- [x] 정적/단위 검증.
  - `npx tsc --noEmit` PASS
  - `npx jest src/components/features/dog/DogPhotoPicker.test.tsx supabase/functions/__tests__/generate-report.test.ts --runInBand` PASS (8 tests)
  - `cd Backend && venv/bin/pytest tests/test_schemas.py tests/test_routers.py -q` PASS (28 tests)
  - `git diff --check` PASS
- [x] DEV_LOCAL 실기기 진입.
  - Metro `http://localhost:8081/status` → `packager-status:running`
  - FastAPI `http://localhost:8765/health` → `{"status":"ok"}`
  - adb reverse: `8081`, `5173`, `8765` 모두 등록.
  - tmux 기반 서버 유지 후 `intoss://taillog-app/ops/settings` 재진입 성공. Metro `BUNDLE ./index.ts`, `Running "shared"`, `/ops/settings::screen` 로그 확인.
  - 첫 재진입에서는 preferred auth flow가 B2C로 남아 `auth.users.user_metadata.role=user`가 사용되어 `/dashboard`로 redirect. `public.users.role=org_owner`와 org membership은 존재했으므로 AuthContext가 public role을 보조 기준으로 읽도록 수정.
  - 재검증: `intoss://taillog-app/ops/settings`가 `운영 설정` 화면으로 직접 렌더되고 `멍멍피트` 센터 정보/직원/강아지 수 표시.
  - 증적: `/tmp/taillog-qa/devlocal-after-ops-settings-launch.png`, logcat `ReactNativeJS Running "shared"` at 2026-05-20 23:03 KST.
- [x] Remote `org-logos` migration.
  - `supabase migration list` 기준 원격 history가 `20260504000001` 이후 local migration을 미적용으로 표시하고, `db push --dry-run`은 remote-only `20260228` history 불일치로 중단.
  - `20260520000300_org_logos_storage_policies.sql`만 `psql`로 단독 적용 후 `supabase migration repair --status applied 20260520000300` 실행.
  - 원격 검증: `storage.buckets`에 `org-logos public=true`, `pg_policies`에 `org_logos_public_read`, `org_logos_owner_insert/update/delete` 4개 존재.
  - 프론트 `requestBackend`는 비JSON 500 응답도 상태코드를 보존하도록 보강해, 개발모드에서 `SyntaxError: Unexpected character`로 원인이 숨겨지지 않게 함.
- [x] `/ops/settings` 센터 로고 DEV_LOCAL 업로드/저장.
  - OS 사진 권한 시트 → Android Photo Picker → 선택 이미지 preview → 저장까지 PASS.
  - Storage object 생성: `org-logos/0b74ada9-9ae3-4aec-907b-3ee84db251b2/22ada339-d6a5-4628-9018-28134db8f5d6-1779287745880.jpg`.
  - DB 저장: `organizations.logo_url`이 public `org-logos` URL로 갱신되고 화면 재진입 시 "등록됨"과 썸네일 표시.
  - 발견/수정: FastAPI `update_org`가 `org_members.role` 문자열을 Enum처럼 `.value`로 읽어 500 발생. 문자열/Enum 양쪽 처리로 수정 후 앱 재저장 시 `PATCH /api/v1/org/22ada...` HTTP 200 확인.

- [x] 2026-05-21 문서 정합성 패스.
  - `PROJECT-STATUS.md`, `PROGRESS-CHECKLIST.md`, `MISSING-AND-UNIMPLEMENTED.md`, `SUPABASE-SCHEMA-INDEX.md`, `AGENTS.md`를 `PAGE-UPGRADE-BOARD.md` 기준으로 정렬.
  - B2B는 `/ops/settings` 로고 DEV_LOCAL PASS와 remote `org-logos` 적용은 완료로 기록하되, `/ops/today`, `/ops/settings`, `/parent/reports`는 공유/성능/B2C 회귀 잔여 때문에 `QA`, B2B-001 parity는 `In Progress`로 유지.
- [x] 2026-05-21 DEV_LOCAL B2B/B2C 로그아웃 전환 회귀.
  - 재현: B2B 권한이 있는 계정에서 로그아웃 후 B2C `토스로 시작하기`로 진입해도 `public.users.role=org_owner`가 다시 적용되어 대시보드에 `센터 운영 대시보드` 배너와 `운영` 탭이 남음.
  - 수정: `preferredFlow=B2C`가 있으면 세션 유효 role을 `user`로 고정하고, B2B 플로우 또는 cold restore에서만 `public.users.role`의 B2B role을 보조 기준으로 사용.
  - 추가 수정: B2C 로그인은 native Toss login 전에 `preferredAuthEntryFlow=B2C`를 먼저 저장하고, `_app.tsx` OrgBootstrap은 비인증/B2C 전환 시 stale org context를 즉시 비움.
  - 실기기 PASS: B2C 재진입 시 하단 탭 `홈/훈련/설정`만 표시되고 `센터 운영 대시보드`/`운영` 탭 미노출.
  - 실기기 PASS: 다시 로그아웃 후 `센터·훈련사 관계자이신가요?` 진입 시 `/ops/today`의 `오늘의 운영`과 하단 `운영` 탭 표시.
  - 증적: `/tmp/taillog-qa/auth-switch-after-fix-b2c-dashboard.png`, `/tmp/taillog-qa/auth-switch-after-fix-logged-out-welcome.png`, `/tmp/taillog-qa/auth-switch-after-fix-b2b-ops.png`.
- [!] 2026-05-21 최신 AIT 배포본 전환 반복 QA.
  - Runtime: actual Toss app `viva.republica.toss`, Metro off (`localhost:8081` connection refused), top activity `viva.republica.toss/im.toss.rn.granite.core.GraniteActivity`.
  - AIT target: latest documented production QA deployment `019e47f8-1d41-72e4-b9d5-dcdae97066b9`.
  - Cycle 1: logout → `센터·훈련사 관계자이신가요?` tap. Logcat shows `flow: 'B2B'`, `login-with-toss success`, `sessionEstablished: true`, but route markers start `/dashboard`; `/ops/today` is not rendered.
  - Cycle 1 fallback: `토스로 시작하기` B2C login succeeds and B2C dashboard shows only `홈/훈련/설정`, no `운영` tab.
  - Cycle 2: logout → B2B tap repeats same failure. Logcat again shows B2B session bridge success, then `/dashboard` API markers; UI remains non-B2B.
  - Direct `intoss://taillog-app/ops/today` in actual Toss host returns host dialog `지금은 서비스를 사용할 수 없어요`, so this is not a valid workaround for private AIT QA.
  - DB cross-check for current Toss user `2732a53d-...`: `public.users.role=org_owner`, but no `org_members` row; existing org `멍멍피트` belongs to user `0b74ada9-...`, has only 1 active `org_dogs` row and one pending report without `share_token`.
  - Result: latest AIT does not yet prove the DEV_LOCAL auth-switch fix; B2B UI entry is `FAIL`, B2C entry is `PASS`.
  - Blocked: share CTA device validation and 40-dog list measurement require a reachable B2B org screen plus seeded/linked org data. Current AIT account/org state has neither.
  - Evidence: `/tmp/taillog-qa/ait-switch-share-perf/00-current-b2c-dashboard.png`, `/tmp/taillog-qa/ait-switch-share-perf/07-cycle1-b2c-login-after-b2b-fail.png`, `/tmp/taillog-qa/ait-switch-share-perf/09-cycle2-b2b-attempt-result.png`, `/tmp/taillog-qa/ait-switch-share-perf/05-direct-ops-today-after-b2b-login.png`.

## Next

- [x] B2B 리포트 생성 플로우를 FastAPI 생성 후 Edge `generate-report` 실행 또는 FastAPI 내부 생성으로 연결.
- [x] 발송을 `getTossShareLink` + 실제 공유/메시지 CTA로 교체하고 `daily_reports.toss_share_url` 저장.
- [x] `/ops/settings` 센터 로고 업로드/표시/수정 추가.
- [ ] `/parent/reports`와 `/report/[shareToken]` 보호자 뷰를 B2C 수준의 읽기 UX로 재구성.
- [x] Supabase remote `org-logos` migration 단독 적용 + migration history `20260520000300` applied repair.
- [x] B2B org role 계정으로 `/ops/settings` 로고 업로드 DEV_LOCAL 실기기 재검증.
- [x] B2B/B2C 로그아웃 후 재진입 전환 DEV_LOCAL 실기기 재검증.
- [x] DEV_LOCAL current Toss QA user org membership 연결 + 40마리 seed.
- [x] DEV_LOCAL B2B/B2C 전환 2회 반복 PASS.
- [x] DEV_LOCAL `/ops/today` 40마리 성능 실측 PASS.
- [x] DEV_LOCAL 리포트 생성/공유 CTA 저장/공유시트 재검증 PASS.
- [x] 새 AIT `019e481f-07f3-7fa5-8d14-388ba45f23f0` 빌드/업로드 PASS.
- [!] Metro-off actual Toss 재검증은 ADB device disconnect로 BLOCKED.
