# onboarding/ — 최초 진입 플로우

Journey A (Cold Start < 3분): login → welcome → survey(7단계) → survey-result → notification → dashboard

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-1, 9-2, 11.3
- 여정 흐름: `Skill("toss_journey")` Journey A

## 파일

| 파일 | 용도 | 레이아웃 |
|------|------|---------|
| `welcome.tsx` | 가치 제안 카드 + Lottie(cute-doggie) + CTA | Standalone |
| `survey.tsx` | 7단계 설문 (SurveyContainer 위임) | C (입력폼형) |
| `survey-result.tsx` | AI 요약 + Skeleton 블러 티저 + 광고/기록 CTA | B (상세형) |
| `notification.tsx` | 알림 허용 체크박스 3개 + Lottie(벨) | B (상세형) |
