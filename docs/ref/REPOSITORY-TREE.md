# Repository Tree Snapshot

Last updated: 2026-05-12 KST

This snapshot was generated for architecture scanning while explicitly excluding heavy/generated folders:

- `node_modules/`
- `.git/`
- `Backend/venv/`
- `.expo/`, `.granite/`, `.pytest_cache/`, `.swc/`
- `dist/`, `build/`, `coverage/`
- old compacted `docs/daily/*` and `docs/weekly/*` entries during broad tree scan
- `.ait` build artifacts from detailed scans

## Top-Level Map

```text
TaillogToss/
├── AGENTS.md
├── CLAUDE.md
├── Backend/
│   ├── Dockerfile
│   ├── railway.toml
│   ├── requirements.txt
│   ├── app/
│   ├── alembic/
│   ├── seeds/
│   └── tests/
├── docs/
│   ├── daily/
│   ├── ref/
│   ├── status/
│   └── migration-manifest.yaml
├── pages/
│   ├── coaching/
│   ├── dashboard/
│   ├── dog/
│   ├── legal/
│   ├── onboarding/
│   ├── ops/
│   ├── parent/
│   ├── report/
│   ├── settings/
│   └── training/
├── scripts/
├── src/
│   ├── _app.tsx
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── stores/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── functions/
│   └── migrations/
├── granite.config.ts
├── package.json
└── src/router.gen.ts
```

## Backend FastAPI

```text
Backend/app/
├── main.py
├── core/
│   ├── config.py
│   ├── database.py
│   ├── exceptions.py
│   └── security.py
├── features/
│   ├── analytics/
│   ├── auth/
│   ├── coaching/
│   ├── dashboard/
│   ├── dogs/
│   ├── log/
│   ├── notification/
│   ├── onboarding/
│   ├── org/
│   ├── report/
│   ├── settings/
│   ├── subscription/
│   └── training/
└── shared/
    ├── clients/
    ├── models.py
    └── utils/
```

## Supabase Edge Functions

```text
supabase/functions/
├── _shared/
│   ├── circuitBreaker.ts
│   ├── contracts.ts
│   ├── cooldownPolicy.ts
│   ├── httpAdapter.ts
│   ├── idempotency.ts
│   ├── mTLSClient.ts
│   ├── mtlsMode.ts
│   ├── notiHistoryRepository.ts
│   ├── pepperRotation.ts
│   ├── piiGuard.ts
│   ├── rateLimiter.ts
│   └── tossPiiDecrypt.ts
├── assign-b2b-role/
├── generate-report/
├── grant-toss-points/
├── legal/
├── login-with-toss/
├── send-smart-message/
├── toss-disconnect/
├── verify-iap-order/
└── withdraw-user/
```

## Frontend Runtime Surface

```text
src/
├── lib/
│   ├── api/
│   │   ├── backend.ts
│   │   ├── auth.ts
│   │   ├── coaching.ts
│   │   ├── dashboard.ts
│   │   ├── dog.ts
│   │   ├── iap.ts
│   │   ├── iap-invoke.ts
│   │   ├── log.ts
│   │   ├── notification.ts
│   │   ├── org.ts
│   │   ├── report.ts
│   │   ├── settings.ts
│   │   ├── subscription.ts
│   │   ├── training.ts
│   │   ├── training.feedback.ts
│   │   └── training.rows.ts
│   ├── hooks/
│   ├── performance/
│   ├── queryPersistence.ts
│   └── guards/
├── pages/
├── stores/
├── components/
└── types/
```

## Notes

- `pages/` and `src/pages/` both exist. `src/router.gen.ts` currently imports from `src/pages/**`.
- FastAPI public URL resolution lives in `src/lib/api/backend.ts`.
- Supabase Edge Function calls are concentrated in `src/lib/api/auth.ts`, `src/lib/api/notification.ts`, `src/lib/api/iap.ts`, `src/lib/api/subscription.ts`, and `src/lib/api/iap-invoke.ts`.
- For future scans, keep the exclusion set above to avoid walking dependency/build artifacts.
