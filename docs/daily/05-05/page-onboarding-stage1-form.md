# 2026-05-05 /onboarding/stage1-form

## Status: Done

## Scope

- Route: `/onboarding/stage1-form`
- Parity: `APP-001`

## Change

- Replaced Stage 1 sex, neuter, and age-mode text emoji chips with existing custom `ICONS` assets.
- Allowed chip rows to wrap so three-option rows do not overflow on narrow devices.

## Validation

- `npm run typecheck` PASS
- `npm test -- --runInBand` PASS
- Static emoji sweep: Stage 1 user-facing chip labels cleaned.

## Board Sync

- `docs/status/PAGE-UPGRADE-BOARD.md`: `/onboarding/stage1-form` remains `Done`, `last_updated=2026-05-05`.
