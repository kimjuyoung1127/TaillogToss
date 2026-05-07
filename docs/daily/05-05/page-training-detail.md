# 2026-05-05 /training/detail

## Status: Done

## Scope

- Route: `/training/detail`
- Parity: `UIUX-005`, `UI-TRAINING-DETAIL-001`

## Change

- Replaced the direct-entry no-curriculum empty state emoji with `ICONS['illust-empty-training']`.
- Added a clear empty-state description and CTA to return to `/training/academy`.
- Kept the populated training detail flow unchanged.
- Replaced Plan selector, streak badge, reaction trend, attempt history, and mission tip emojis with existing `ICONS` images or token-color dots.
- Replaced training feedback sheet, day summary, insight summary, and PRO banner emojis with token-color dots or existing `ICONS` images.

## Validation

- `npm run typecheck` PASS
- `npm test -- --runInBand` PASS
- ADB device QA PASS: DevMenu -> `/training/detail` direct entry renders the empty state without runtime error.
- ADB device QA PASS: `훈련 아카데미로 이동` CTA navigates to `/training/academy`.
- Static emoji sweep PASS for the updated training detail components.
- Static sweep now leaves only intentional controls/reaction symbols outside this route scope.
- Evidence screenshots:
  - `/tmp/taillog-training-detail-empty.png`
  - `/tmp/taillog-training-academy-from-empty.png`

## Board Sync

- `docs/status/PAGE-UPGRADE-BOARD.md`: `/training/detail` remains `Done`, `last_updated=2026-05-05`.

## Residual Risk

- Real curriculum deep-link with `curriculum_id` was not changed in this pass; existing flow remains covered by previous training detail QA.
