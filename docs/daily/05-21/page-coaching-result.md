# /coaching/result Production AIT Regression - 2026-05-21

- Scope: UIUX-005, AI-001
- Route: `/coaching/result`
- Runtime: Production Toss AIT, Metro off, DigitalOcean FastAPI backend

## Checks

- [x] Skill mirror consistency restored: `.claude/skills` is the source of truth and `.agents/skills` active entries are now identical; legacy archive folders are excluded.
- [x] Skill mirror maintenance added: `scripts/sync-agent-skills.sh --check|--dry-run|--apply` plus nightly orchestrator `TASK 0`.
- [x] DigitalOcean backend force-build deployed async coaching route. Deployment `2cbc66b6-9de9-4f19-89d4-9918e7952f08` reached `ACTIVE`; `/health` returned HTTP 200 and `POST /api/v1/coaching/generation-jobs` without auth changed from stale 405 to expected 401.
- [x] Latest AIT built and uploaded: deploymentId `019e47f8-1d41-72e4-b9d5-dcdae97066b9`, SHA256 `0849df0539ba28c1bd5f8adc17b3de6583a1109fd44177ed5144728343013ad6`, artifact `taillog-app.ait` ~16MB.
- [x] AIT bundle scan PASS: DigitalOcean URL present, Railway URL `0`, `ait-ad-test-*` `0`, secret markers `0`, `isDevToolsEnabled() { return false; }`, HTTPS brand icon, `coaching/generation-jobs` marker present, async 30~60s copy present.
- [x] Production AIT route launch PASS: `intoss-private://taillog-app/coaching/result?_deploymentId=019e47f8-1d41-72e4-b9d5-dcdae97066b9` opened in `viva.republica.toss`, top activity became `GraniteActivity`, logcat showed `Bundle loading completed successfully`, `Running "shared"`, and no Metro bundle load.
- [x] Production AIT async loader PASS: tapping `새 코칭 받기` showed `{dogName}의 코칭을 만들고 있어요`, `보통 30~60초`, `화면을 나가도 생성 상태를 다시 확인할 수 있어요`, and the three step labels.
- [x] Production AIT leave/re-enter recovery PASS: job `8180ac6a-746c-447f-82e1-b3e268ffe97f` was created at `2026-05-21T00:40:46.079Z`, app was force-stopped at `09:41:18 KST`, backend completed at `2026-05-21T00:41:22.263Z`, and re-entry showed the completed `2026.05.21` latest coaching with `오늘 1/10회 사용`.
- [x] DB timing proof: job total `36.18s`, background run `32.39s`, coaching id `0dbc0511-a64b-47bf-9032-8b794bab81e3`, status `completed`, error `null`.
- [x] QA cleanup: generated job `8180ac6a-746c-447f-82e1-b3e268ffe97f` and coaching `0dbc0511-a64b-47bf-9032-8b794bab81e3` were deleted after screenshot/log evidence capture.

## Evidence

- `/tmp/taillog-qa/ait-019e47f8-coaching-after-reentry-complete.png`
- `/tmp/taillog-qa/ait-019e47f8-coaching-reentry.xml`
- `/tmp/taillog-qa/ait-019e47f8-coaching-logcat.txt`

## Self Review

- Good: AI-001 now has both DEV_LOCAL async proof and Production AIT async proof on the same DigitalOcean backend path.
- Good: the stale backend route issue was caught before AIT regression and fixed by a DigitalOcean force-build.
- Gap: generated QA rows were cleaned, so DB evidence is recorded in this log rather than left queryable in production.

Board Sync: `/coaching/result` remains `Done`; AI-001 production AIT regression is now closed.
