# /coaching/result UX Hardening - 2026-05-20

- Scope: UIUX-005, AI-001
- Skill: `page-coaching-result-upgrade`, `feature-data-binding-and-loading`

## Changes

- [x] Frontend maps user-visible English tools and curriculum ids to Korean labels for coaching result rendering.
- [x] Backend normalizes generated coaching tool labels before persistence to reduce new English leakage.
- [x] Seven-day plan cards are tap targets and open a `ModalLayout` bottom-sheet detail with goal/tasks/time/place/tools/progression/reference sections when PRO content is unlocked.
- [x] Free-state PRO lock UX remains in place for the 7-day plan, risk signals, and consultation questions.
- [x] Coaching generation loading UX now uses `perrito-corriendo` Lottie instead of static icon/spinner and passes the active dog name into the loader.
- [x] Synchronous-generation copy is explicit: 10~30s wait, keep this screen open, and leaving the screen does not guarantee completion.
- [x] Generation step labels were rewritten from internal pipeline wording to user-facing steps: recent records, repeated patterns, custom coaching.
- [x] Async generation v1 implemented after DEV_LOCAL 53.8s evidence: `coaching_generation_jobs` DB migration/model, `POST /api/v1/coaching/generation-jobs`, `GET /api/v1/coaching/generation-jobs/{job_id}`, FastAPI background runner with fresh DB session, active-job reuse, daily limit including active jobs, and 10-minute stale failure handling.
- [x] `/coaching/result` now starts a generation job, polls every 2 seconds, stores `coaching_generation_job_${userId}_${dogId}` in Toss Storage, restores polling on re-entry, updates latest coaching cache on completion, and clears the stored job on completed/failed.
- [x] Loader copy is now async-accurate: 30~60s expectation, leaving the screen is recoverable by checking generation status again, and completion will show the latest result.

## DEV_LOCAL QA

- [x] Dashboard `지난 진단 보기` reached `/coaching/result`. Evidence: `/tmp/taillog-qa/dev-local-coaching-cta-pass.png`
- [x] Latest coaching result rendered and scrolled through insight/action/dog voice sections without JS crash. Evidence: `/tmp/taillog-qa/dev-local-coaching-detail-scrolled-1.png`, `/tmp/taillog-qa/dev-local-coaching-detail-scrolled-2.png`
- [x] Free user lock state for 7-day plan remained visible and did not expose raw English/internal ids. Evidence: `/tmp/taillog-qa/dev-local-coaching-7day-cards.png`
- [x] 2026-05-20 follow-up DEV_LOCAL: removed the fixed bottom `훈련 시작하기` CTA from `/coaching/result`; route still renders latest coaching without JS crash. Evidence: `/tmp/taillog-qa/dev-local-coaching-result-no-fixed-cta.png`
- [x] 2026-05-20 follow-up unit/static: `npx jest src/components/features/coaching --runInBand --passWithNoTests` PASS, `npx tsc --noEmit` PASS.
- [x] 2026-05-20 follow-up DEV_LOCAL server baseline: Metro `/status` running, FastAPI `/health` OK, adb reverse `8081/5173/8765` present.
- [x] 2026-05-20 follow-up DEV_LOCAL route: `/coaching/result` launched in `viva.republica.toss.test`; latest coaching and `새 코칭 받기` rendered. Evidence: `/tmp/taillog-qa/dev-local-coaching-loader-check.png`
- [x] 2026-05-20 follow-up DEV_LOCAL auth recovery: restarted Metro with `EXPO_PUBLIC_SHOW_DEV_MENU=true`, restarted FastAPI, restored adb reverse `8081/5173/8765`, and verified authenticated local API traffic (`/api/v1/settings/`, `/api/v1/coaching/usage/daily`, `/api/v1/coaching/{dog_id}/latest` all 200).
- [x] 2026-05-20 follow-up backend compatibility: `onboarding_context.stage2` legacy list fields now normalize before prompt rendering, fixing `POST /api/v1/coaching/generate` 500 (`'list' object has no attribute 'get'`) for the DEV_LOCAL stable session.
- [x] 2026-05-20 follow-up DEV_LOCAL generation visual: tapping `새 코칭 받기` showed the Lottie loader immediately and completed successfully. Measured request start `21:35:55.277`, `ai_coach_completed` `21:36:49.085` (~53.8s); loader first visible at ~0.08s and was still visible at 49.99s. Evidence: `/tmp/taillog-qa/coaching-measure-loader.png`, `/tmp/taillog-qa/coaching-measure-after-complete.png`
- [x] 2026-05-20 async implementation static/unit: `npx tsc --noEmit` PASS, `npx jest src/components/features/coaching src/lib/api/__tests__/coaching.test.ts --runInBand --passWithNoTests` PASS, `Backend/venv/bin/pytest Backend/tests/test_coaching_prompts.py Backend/tests/test_schemas.py -q` PASS, `Backend/venv/bin/python -m compileall Backend/app/features/coaching Backend/app/shared/models.py` PASS.
- [x] 2026-05-20 async DEV_LOCAL E2E: migration applied, stable session auth recovered, `POST /api/v1/coaching/generation-jobs` returned job `f5ccfe2d-e6e9-4f79-a657-4ed489f03227`, loader showed async copy (`30~60초`, screen leave recoverable), `GET /api/v1/coaching/generation-jobs/{job_id}` polled every 2s with HTTP 200, OpenAI returned 200, DB changed to `completed` at ~42s with coaching `5168449b-5d61-4d8c-b33a-e8761bad8b97`, and UI switched from loader to result at ~46s.
- [x] 2026-05-20 async cleanup/restore: temporary generated job/coaching/subscription rows were deleted, temporary query persistence key change was reverted, and follow-up `npx tsc --noEmit` PASS confirmed no source diff remained from the QA workaround.
- [~] 2026-05-20 follow-up leave/re-enter QA attempt: DEV_LOCAL root launch and Metro/FastAPI health were OK, and frontend resolved to local FastAPI (`127.0.0.1:8765`). DB-backed FastAPI routes then returned 500 because the current Supabase pooler reported `ECIRCUITBREAKER: too many authentication failures`; explicit leave/re-enter visual QA remains blocked until the current Supabase DB credential/circuit breaker is restored. Railway is not part of this DEV_LOCAL path.
- [x] 2026-05-20 follow-up Supabase recovery: `select 1` against the current Supabase pooler succeeded, Supabase REST smoke returned HTTP 200, and FastAPI was restarted to clear the stale failed pool. Railway was excluded; DEV_LOCAL uses local FastAPI + current Supabase.
- [x] 2026-05-20 async leave/re-enter visual QA: after clearing stale query cache and temporarily enabling PRO for the test user, `/coaching/result` showed `새 코칭 받기` and `오늘 1/10회 사용`; tapping it created job `f6906397-95a2-498a-ab4d-3ab8cab8fb1c`, showed the async Lottie loader/copy, then the app was force-stopped and relaunched to `/coaching/result`. Re-entry restored polling and showed the loader again, then completed to the latest result with `오늘 2/10회 사용`. Backend job timestamps: `created_at=14:15:56.263Z`, `completed_at=14:16:51.545Z` (~55.3s), coaching `42d238b5-004b-40bd-87a6-ec66c2ccfd06`. Evidence: `/tmp/taillog-qa/coaching-reentry-loader-before-exit.png`, `/tmp/taillog-qa/coaching-reentry-after-reenter.png`, `/tmp/taillog-qa/coaching-reentry-after-complete.png`.
- [x] 2026-05-20 async QA cleanup: test job `f6906397-95a2-498a-ab4d-3ab8cab8fb1c`, generated coaching `42d238b5-004b-40bd-87a6-ec66c2ccfd06`, and the temporary subscription row were deleted. The original subscription state was `null`, so no test entitlement remains.
- [x] 2026-05-20 PRO 7-day bottom-sheet QA: latest coaching `f7993682-3b3e-492a-b134-26c08a7eb121` contains `next_7_days.days=7`. With temporary PRO enabled, `/coaching/result` rendered unlocked `7일 맞춤 플랜` timeline cards (`1일차`, `2일차`, `시간`, `장소`, `다음 기준`, `자세히 보기`) without `PRO 전용` lock copy. Tapping `1일차` opened the `1일차 자세히 보기` bottom sheet with focus, tasks, `시간`, `장소`, `준비물`, `다음 단계 기준`, and `참고 훈련`; close button returned to the timeline. Evidence: `/tmp/taillog-qa/coaching-7day-timeline.png`, `/tmp/taillog-qa/coaching-7day-bottom-sheet.png`, `/tmp/taillog-qa/coaching-7day-after-close.png`.
- [x] 2026-05-20 PRO 7-day QA cleanup: temporary subscription row was deleted and the original subscription state (`null`) was restored.

## Self Review

- Good: existing DB rows are corrected at render time, while new backend generations also reduce English tool leakage.
- Good: generation loading now accurately communicates the current synchronous request/response contract and avoids promising background completion.
- Good: DEV_LOCAL session auth now reaches FastAPI generate with a valid Supabase user, and generation completes into the 2026.05.20 coaching result.
- Good: the async v1 path no longer depends on the user keeping the request screen alive; the app can restore an active job from Storage and poll backend state.
- Good: DEV_LOCAL proved the new async path end-to-end at runtime: job creation returned immediately, backend generation continued independently, polling observed completion, and the result screen updated without waiting on the original generate request.
- Good: explicit leave-and-re-enter visual QA now passes: app termination during generation does not cancel backend generation, and re-entry resumes polling from the stored job id.
- Good: unlocked PRO 7-day bottom-sheet interaction now passes with real latest coaching data and localized detail fields.
- Gap: async generation still uses FastAPI `BackgroundTasks`; if the server process restarts mid-job, stale handling marks the job failed and asks the user to retry. Redis/Celery remains a later hardening step if volume rises.
- Gap: production AIT regression is still a separate release-build check; route-level DEV_LOCAL QA is complete.

Board Sync: `/coaching/result` is `Done`; async job implementation, migration, DEV_LOCAL start→poll→complete result transition, explicit leave/re-enter recovery, and unlocked PRO 7-day bottom-sheet QA are verified. Production AIT regression remains tracked under AI-001, not as a route-level DEV_LOCAL blocker.
