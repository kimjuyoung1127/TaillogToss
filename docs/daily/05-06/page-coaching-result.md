# 2026-05-06 /coaching/result

## Status: Done

## Scope

- Route: `/coaching/result`
- Parity: `UIUX-005`, `AI-001`, `UI-001`
- Skills: `page-coaching-result-upgrade`, `feature-data-binding-and-loading`

## Fixes

- `메이의 마음` 말풍선 내부 텍스트가 Android에서 비어 보일 수 있는 케이스를 보강했다.
- `DogVoiceBlockView`가 backend `dog_voice.message` 빈 문자열을 받으면 안전한 fallback 문구를 표시한다.
- `SpeechBubble`이 빈 메시지 fallback을 직접 처리하고, Android row layout에서 텍스트 폭이 접히지 않도록 `alignSelf`, `flexShrink`, `minWidth`를 보강했다.
- `DogVoiceBlockView`와 `SpeechBubble` 회귀 테스트를 추가했다.
- `computeTrainingEffects` 날짜 기반 테스트를 고정 시각으로 안정화했다.

## Evidence

- ADB screenshot: `/tmp/taillog-coaching-result-dog-voice-visible-2.png`
- DB latest dog voice sample: `메이|안녕하세요! 저는 메이에요...|hopeful`
- Recent logcat: no `ReactNativeJS`, `AndroidRuntime`, `FATAL EXCEPTION`, `TypeError`, `ReferenceError`

## Validation

- `npm run typecheck` PASS
- `npx jest --config jest.config.js src/components/tds-ext/__tests__/SpeechBubble.test.tsx src/components/features/coaching/__tests__/FreeBlock.test.tsx --runInBand` PASS
- `npm test -- --runInBand` PASS: app 13 suites / 87 tests, edge 13 suites / 45 tests
- `cd Backend && venv/bin/pytest tests/ -q` PASS: 47 tests

## Remaining

- 실기기 결제 UI 3시나리오 최종 증적은 IAP 콘솔/계정 흐름에서 별도 진행한다.
