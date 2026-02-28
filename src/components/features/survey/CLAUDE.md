# survey/ — 설문 위저드 컴포넌트

onboarding/survey.tsx 페이지에서 사용하는 7단계 설문.

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-2
- 여정: `Skill("toss_journey")` Journey A (Cold Start)

## 파일

| 파일 | 용도 |
|------|------|
| `SurveyContainer.tsx` | 7단계 위저드 컨테이너 (스텝 관리 + FormLayout) |
| `Step1Basic.tsx` | 이름 + 품종 |
| `Step2Environment.tsx` | 생활 환경 (실내/실외, 동거견) |
| `Step3Behavior.tsx` | 문제 행동 8개 Checkbox + 기타 |
| `Step4Triggers.tsx` | 트리거 상황 선택 |
| `Step5History.tsx` | 훈련 이력 |
| `Step6Goals.tsx` | 목표 설정 |
| `Step7Preferences.tsx` | AI 코칭 선호도 |
| `BehaviorTypeBadge.tsx` | 행동 유형 뱃지 |
