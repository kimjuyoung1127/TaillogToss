---
route: /coaching/result
date: 2026-04-23
status: Done
parity: UIUX-005, AI-001, monetization-redesign
---

## 작업 내역

- [x] Pro 블록 잠금(④⑤⑥) 전면 제거 — `CoachingBlockList` `isUnlocked=true`
- [x] R3 광고 배너 삽입 (`!isPro` 조건, `CoachingDetailContent` 상단)
- [x] insightCTA 버튼: Pro→`/coaching/insights` / 무료→`/settings/subscription`
- [x] `result.tsx` 856줄 → 436줄 분리 (`CoachingDetailContent.tsx` 추출)
- [x] `CoachingBlockList` dead `isPro` prop 제거
- [x] tsc 0 errors, Jest 115/115 PASS

## 비고

수익화 모델 전환: 블록 잠금 → 광고 노출(무료) + 인사이트 리포트(Pro).
`LockedBlock` 컴포넌트는 삭제하지 않고 보존 — import 한 줄로 언제든 복원 가능.
