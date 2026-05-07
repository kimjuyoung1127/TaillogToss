# 2026-05-05 /dashboard

## Status: Done

## Scope

- Route: `/dashboard`
- Parity: `UIUX-001`, `UIUX-006`

## Change

- Replaced dashboard active dog fallback avatar with `ICONS['ic-dog']`.
- Replaced short streak fallback flame with existing streak badge image.
- Kept data binding and dashboard card behavior unchanged.

## Validation

- `npm run typecheck` PASS
- `npm test -- --runInBand` PASS
- Static icon sweep: dashboard fallback emojis no longer render as text icons.

## Board Sync

- `docs/status/PAGE-UPGRADE-BOARD.md`: `/dashboard` remains `Done`, `last_updated=2026-05-05`.

## Residual Risk

- DevMenu debug labels intentionally retain emoji-like dev markers and must remain `__DEV__` only.
