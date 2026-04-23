---
route: /coaching/insights
date: 2026-04-23
status: Done
parity: monetization-redesign
---

## 작업 내역

- [x] `/coaching/insights` Pro 전용 화면 신규 생성
- [x] `featureGuard(proOnly)` — 무료 유저 → `/settings/subscription` redirect
- [x] `InsightReportHeader` 컴포넌트 신규 (생성일·분석기간·로그수·top행동)
- [x] `useInsightReport(dogId, coachingId)` 훅 신규 (기존 캐시 재활용, API 추가 없음)
- [x] 기존 `Next7DaysView`, `RiskSignalsView`, `ConsultationView` 재사용 (100%)
- [x] `router.gen.ts` `/coaching/insights` 타입 등록
- [x] 루트 `pages/coaching/insights.tsx` thin re-export 생성
- [x] tsc 0 errors

## 비고

별도 Supabase 테이블/API 없음 — 기존 `getCoachings()` 응답의 `blocks` + `analytics_metadata` 재활용.
