# /onboarding/stage3-form — Pro intake input polish

## Scope
- APP-001
- PRO-INTAKE-001

## Changes
- [x] `강점/보호요인` 입력을 single-line input에서 multiline text area로 맞췄다.
- [x] 예시 placeholder를 두 줄로 나눠 Android/Toss 화면에서 잘려 보일 가능성을 줄였다.

## Validation
- [x] `npx tsc --noEmit` — passed
- [x] `git diff --check -- src/pages/onboarding/stage3-form.tsx docs/daily/05-27/page-onboarding-stage3-form.md` — passed
- [x] `ait build` — passed, `deploymentId=019e699f-4bc6-71d7-90c1-535a75a7b270`
- [x] `ait deploy --scheme-only` — passed, `intoss-private://taillog-app?_deploymentId=019e699f-4bc6-71d7-90c1-535a75a7b270`
- [x] AIT bundle scan — DigitalOcean/Supabase endpoints present, test ad ids `0`, local icon leaks `0`, dev tools disabled.
- [x] Android Toss device QA — `/onboarding/stage3-form` opened with the new deployment and `강점/보호요인` placeholder rendered as two visible lines.
- [x] Screenshot captured — `/tmp/taillog-stage3-pro-intake-019e699f.png`

## Board Sync
- [x] `docs/status/PAGE-UPGRADE-BOARD.md` `/onboarding/stage3-form` remains `Done`.

## Risks
- [x] AIT 재빌드/실기기 시각 확인 완료.
