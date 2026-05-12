# Railway FastAPI vs Supabase Edge Function Migration Audit

Last updated: 2026-05-12 KST

## Scan Guardrails

The scan intentionally excluded heavy/generated folders:

- `node_modules/`
- `.git/`
- `Backend/venv/`
- `.expo/`, `.granite/`, `.pytest_cache/`, `.swc/`
- `dist/`, `build/`, `coverage/`
- `.ait` build artifacts

Main scanned surfaces:

- FastAPI: `Backend/app/main.py`, `Backend/app/features/**`
- Frontend API clients: `src/lib/api/**`
- Supabase Edge Functions: `supabase/functions/**`
- Runtime docs: `supabase/functions/CLAUDE.md`, `docs/status/PROJECT-STATUS.md`

## Current Runtime Split

### Railway / FastAPI

Railway hosts the FastAPI service behind:

```text
https://taillogtoss-backend-production.up.railway.app
```

Frontend entrypoint:

```text
src/lib/api/backend.ts
```

FastAPI routes are registered in `Backend/app/main.py` under `/api/v1`.

### Supabase Edge Functions

Supabase Edge Functions are already used for Toss/Supabase-adjacent work:

| Function | Current Role | Frontend/Server Callers | Migration Note |
|---|---|---|---|
| `login-with-toss` | Toss OAuth2 + mTLS + Supabase session bridge | `src/lib/api/auth.ts` | Already correctly on Edge. Keep there. |
| `verify-iap-order` | Toss IAP verify + grant/subscription update | `src/lib/api/iap.ts`, `src/lib/api/subscription.ts`, FastAPI proxy | Already on Edge, but direct mini-app calls can fail/hang, so FastAPI proxy remains useful. |
| `send-smart-message` | Smart Message S2S send + cooldown | `src/lib/api/notification.ts` | Already correctly on Edge. |
| `grant-toss-points` | Toss points grant S2S | no primary app caller found in this scan | Keep on Edge because mTLS is required. |
| `generate-report` | B2B report AI generation | Edge tests/docs; FastAPI also has report routes | Edge candidate already exists, but frontend currently uses FastAPI report API. |
| `legal` | terms/privacy/marketing/ads HTML | Toss console/legal URL use | Keep on Edge/static. |
| `toss-disconnect` | Toss disconnect callback | Toss server callback | Keep on Edge because public callback + service role behavior. |
| `withdraw-user` | delete public/auth user | `src/lib/api/auth.ts` | Already correctly on Edge. |
| `assign-b2b-role` | assign user role via Admin API | `src/lib/api/auth.ts` | Already correctly on Edge. |

## FastAPI Feature Inventory

| Domain | Main Routes | Frontend API Client | Current DB/External Work | Edge Migration Fit |
|---|---|---|---|---|
| Auth profile | `/api/v1/auth/me`, `DELETE /me` | mostly Edge auth; profile routes less prominent | Supabase auth verification + users table | Low. Login/withdraw already Edge; profile can stay direct/FastAPI. |
| Onboarding | `/api/v1/onboarding/survey*` | `src/lib/api/dog.ts` | creates/updates `dogs`, `dog_env`, survey JSON | Medium. Possible on Edge, but multi-stage writes and validation are already stable in FastAPI. |
| Dogs | `/api/v1/dogs*` | partially `src/lib/api/dog.ts` | dog profile CRUD, ownership | Medium. Reads could move/direct Supabase; writes need careful RLS/ownership parity. |
| Logs | `/api/v1/logs*` | `src/lib/api/log.ts` | behavior log CRUD, limit support | Medium-High for reads; writes are simple but need RLS/error parity. |
| Dashboard | `/api/v1/dashboard/` | `src/lib/api/dashboard.ts` | compact dog/env/log aggregate | High. DB aggregate/read-heavy and latency-sensitive. |
| Analytics | `/api/v1/dogs/{dog_id}/behavior-analytics`, `/step-attempts` | `src/lib/api/training.ts`, `training.feedback.ts` | ownership + SQL aggregate + rows | Highest. Current bottleneck is first DB call on Railway; Edge is close to Supabase. |
| Training | `/api/v1/training*` | `src/lib/api/training*.ts` | user training status CRUD + shared rows | High for `GET /training/{dog_id}`; medium for mutations. |
| Coaching | `/api/v1/coaching*` | `src/lib/api/coaching.ts` | OpenAI, budget limits, DB writes, safety filters | Low-Medium. Heavy Python prompt/business logic; keep FastAPI unless migrating deliberately. |
| Settings | `/api/v1/settings/` | `src/lib/api/settings.ts` | small user settings read/write | Medium. Easy to move, but not a current bottleneck. |
| Subscription | `/api/v1/subscription/*` | `src/lib/api/subscription.ts`, `iap.ts` | subscription reads/order history + proxy to `verify-iap-order` | Mixed. Reads can move/direct Supabase; IAP proxy should remain unless mini-app Edge networking is fixed. |
| Notification history | `/api/v1/notification/*` | `src/lib/api/notification.ts` | read/update `noti_history` | Medium. Simple DB operations; not performance-critical. |
| Org/B2B | `/api/v1/org*` | `src/lib/api/org.ts` | membership/role checks, dog assignments, org stats | Low-Medium. Complex authorization; avoid moving first. |
| Report/B2B | `/api/v1/report*` | `src/lib/api/report.ts` | report CRUD/share/interactions | Medium. `generate-report` Edge exists, but FastAPI report data surface is broader. |

## Key Findings

1. Railway is not only used by behavior analytics.

   The app uses FastAPI broadly for dashboard, logs, coaching, training, onboarding, settings, subscription, notification, org, and report routes. Removing Railway entirely would require replacing many endpoints or reverting many frontend clients to direct Supabase.

2. Supabase Edge Functions already own the Toss S2S boundary.

   mTLS/Toss-sensitive work is already in Edge Functions: login, IAP verify, Smart Message, points, disconnect. This matches the local rule in `supabase/functions/CLAUDE.md`: FastAPI should not implement mTLS.

3. The best first migration candidate is not all FastAPI. It is one or two read-heavy endpoints.

   Current measured bottleneck is `/api/v1/dogs/{dog_id}/behavior-analytics`; the SQL itself is fast, but Railway wake/region/connection path makes `dog_lookup_ms` large. This endpoint is mostly DB read/aggregate and maps well to Edge.

4. Direct Edge calls are not universally safe in the Toss mini-app.

   IAP code documents that `/functions/v1/verify-iap-order` can be blocked/hang in the mini-app runtime, so FastAPI currently proxies `/api/v1/subscription/iap/verify` to Edge. Before moving user-facing routes to Edge, each route needs real-device network verification.

## Migration Candidates

### 1. Move behavior analytics to Edge first

Candidate:

```text
GET /api/v1/dogs/{dog_id}/behavior-analytics?days=30
```

Proposed Edge function:

```text
supabase/functions/behavior-analytics/index.ts
```

Why this is the best first move:

- Highest measured backend pain.
- Mostly SQL aggregate + simple response shape.
- No OpenAI dependency.
- No Toss mTLS dependency.
- Can be deployed side-by-side and selected by frontend fallback.

Required work:

- Verify Supabase JWT from `Authorization` header.
- Reimplement ownership check:
  - B2C: `dogs.id = dog_id AND dogs.user_id = auth_user.id`
  - B2B fallback: preserve `org_dogs` / `dog_assignments` access behavior from `Backend/app/shared/utils/ownership.py`
- Reimplement aggregate SQL currently in `Backend/app/features/analytics/service.py`.
- Return same response shape as `BehaviorAnalyticsResponse`.
- Add timing headers or response timing fields similar to `X-Taillog-Server-Timing`.
- Frontend should call Edge first for this one endpoint, then fall back to FastAPI if Edge is blocked or errors.

Risk:

- Ownership parity is the main risk. Do not simplify away B2B fallback without a product decision.

### 2. Move dashboard aggregate second

Candidate:

```text
GET /api/v1/dashboard/?dog_id=...&log_limit=20
```

Why:

- Also latency-sensitive.
- Mostly reads `dogs`, `dog_env`, `behavior_logs`.
- Current FastAPI optimization already reduced DB round trips; Edge could reduce Railway wake/region cost.

Risk:

- Dashboard response shape aggregates several UI assumptions. Keep FastAPI fallback during rollout.

### 3. Move training rows read third

Candidate:

```text
GET /api/v1/training/{dog_id}
```

Why:

- Frequently launched with `/training/academy`.
- Already shared between progress/feedback in frontend.
- Simple table read from `user_training_status`.

Risk:

- Mutations should remain FastAPI/direct Supabase until read path is stable.

## Keep on FastAPI for Now

| Feature | Reason |
|---|---|
| Coaching generate / ask-coach | Python OpenAI prompt stack, budget enforcement, safety filtering, many DB side effects. |
| Org/B2B management | Authorization surface is broad and higher-risk. |
| Report full CRUD | Edge `generate-report` exists, but full report API has share/interactions/update semantics. |
| IAP proxy | Direct Edge calls can fail in Toss mini-app; FastAPI proxy is an operational workaround. |
| Onboarding multi-stage writes | Important but not current performance bottleneck; move only after read-heavy endpoints are proven. |

## Recommended Rollout

1. Keep Railway for all current FastAPI routes.
2. Add a new Edge Function only for `behavior-analytics`.
3. Add frontend function `getBehaviorAnalyticsFromEdge()` with:
   - Edge first
   - FastAPI fallback
   - same perf markers
4. Compare on AIT:
   - FastAPI current: `dog_lookup_ms` latest warm `3156.4ms`
   - Edge candidate: measure total Edge response time and page fresh settle
5. If Edge wins and is stable, repeat pattern for dashboard aggregate.
6. Only then consider broader Railway reduction.

## Decision

Railway is not mandatory long-term, but it is currently a broad backend surface. The safest path is not a full migration. It is a targeted Edge migration for read-heavy, latency-sensitive endpoints, starting with `behavior-analytics`.
