# /settings/subscription — contactsViral PRO 1일권

Parity: IAP-001, GROWTH-001

## Done

- [x] 공식 `contactsViral({ options: { moduleId }, onEvent, onError })` 경로를 구독 화면 공유 CTA에 연결했다.
- [x] `sendViral` 이벤트에서만 `POST /api/v1/referral/reward/contacts-viral` 지급 API를 호출하도록 했다.
- [x] `closeReason=noReward` 및 SDK 미지원 환경에서는 `PRO_DAY_PASS` 지급을 차단하고 일반 공유/안내 fallback으로 분리했다.
- [x] `user_entitlements` 기반 `PRO_DAY_PASS`를 추가하고 구독 row와 합산한 `effective_is_pro` 판정을 만들었다.
- [x] `useIsPro`/`useProStatus`, 코칭 한도, 1:1 코치, 훈련 PRO gate가 `effective_is_pro`를 따르도록 연결했다.
- [x] 같은 `user/module` 기준 KST 1일 1회 duplicate grant 차단을 테스트했다.
- [x] AIT 빌드용 `granite.config.ts` define에 `EXPO_PUBLIC_CONTACTS_VIRAL_PRO_DAY_PASS_MODULE_ID`를 추가했다.
- [x] 운영 백엔드에서 `CONTACTS_VIRAL_PRO_DAY_PASS_MODULE_ID` 미설정 시 지급 API가 503으로 닫히도록 보강했다.
- [x] 원격 Supabase에 `20260522000100_user_entitlements.sql` 단일 적용을 실행했고, `user_entitlements` 인덱스 조회까지 확인했다.
- [x] Toss 콘솔 리워드 ID `a1c00816-d46a-4754-b3af-27ea7d028dc1`를 `.env`/`Backend/.env`에 등록했다.
- [x] DigitalOcean backend force-build 배포 후 referral route no-auth smoke가 401로 응답해 운영 route 반영을 확인했다.
- [x] AIT `019e4e15-2489-7f1a-9a82-092ab1e56fa4` 빌드/업로드 후 Metro off actual Toss 앱에서 `/settings/subscription` 공유 CTA를 실행했다.
- [x] contactsViral native 화면 진입 및 친구 목록 `기회 1개 받기` UI를 확인했고, DB `user_entitlements`에 `PRO_DAY_PASS` row 생성까지 확인했다.

## Validation

- [x] `Backend/venv/bin/pytest Backend/tests/test_models.py Backend/tests/test_routers.py Backend/tests/test_subscription_entitlements.py -q` — 26 passed
- [x] `npx jest src/lib/hooks/__tests__/useContactsViralReward.test.tsx --runInBand` — 3 passed
- [x] `npx tsc --noEmit` — passed
- [x] `git diff --check` — passed
- [x] `supabase db query --linked --file supabase/migrations/20260522000100_user_entitlements.sql` — executed
- [x] `pg_indexes` check — `idx_user_entitlements_active`, `idx_user_entitlements_user_id`, `user_entitlements_contacts_viral_daily_key`, `user_entitlements_pkey`
- [x] migration history repair — `20260522000100` inserted with `on conflict do nothing`
- [x] AIT bundle scan — reward moduleId present, DigitalOcean backend URL present, `ait-ad-test-*` count 0, `isDevToolsEnabled() -> return false`
- [x] Actual Toss Metro-off launch — `viva.republica.toss` `GraniteActivity`, `Bundle loading completed successfully`, `Running "shared"`, `deploymentId=019e4e15-2489-7f1a-9a82-092ab1e56fa4`
- [x] DB reward proof — `user_entitlements.id=e7ef7571-c9ad-4d5d-9f8b-0f6937aca4b7`, `type=PRO_DAY_PASS`, `source=contacts_viral`, `expires_at=2026-05-23 05:19:37 UTC`

## Remaining QA

- [x] Toss 콘솔 공유 리워드 `테일로그 PRO 1일권` 생성 후 `CONTACTS_VIRAL_PRO_DAY_PASS_MODULE_ID`/`EXPO_PUBLIC_CONTACTS_VIRAL_PRO_DAY_PASS_MODULE_ID`에 moduleId 등록
- [x] `Backend/.env`와 `.env`에 moduleId 등록 후 DigitalOcean backend update + AIT build/deploy
- [x] 실제 토스앱에서 contactsViral native 화면 진입 및 `user_entitlements` row 생성 확인
- [ ] `/coaching/result`, `/training/detail`, `/dog/switcher` PRO 동작은 이미 유료 PRO 계정이라 day pass 단독 계정으로 추가 확인 필요
- [ ] 테스트용 짧은 만료값 또는 DB clock 조작으로 FREE 자동 복귀 확인
