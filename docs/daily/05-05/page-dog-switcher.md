# 2026-05-05 /dog/switcher

## Status: Done

## Scope

- Route: `/dog/switcher`
- Parity: `UIUX-006`

## Change

- `DogAvatar` default fallback now uses `ICONS['ic-dog']` instead of a text emoji.
- The switcher item behavior and active-state check indicator are unchanged.

## Validation

- `npm run typecheck` PASS
- `npm test -- --runInBand` PASS

## Board Sync

- `docs/status/PAGE-UPGRADE-BOARD.md`: `/dog/switcher` remains `Done`, `last_updated=2026-05-05`.

## Residual Risk

- Real uploaded profile images were not modified.
