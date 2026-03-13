# coaching/ — AI 코칭 결과 컴포넌트

coaching/result.tsx 페이지에서 사용하는 6블록 코칭 UI.

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-6
- TDS 컴포넌트: `Skill("toss_apps")` §3

## 파일

| 파일 | 용도 |
|------|------|
| `FreeBlock.tsx` | 무료 3블록 (트렌드, 패턴, 강아지 시점) |
| `LockedBlock.tsx` | PRO 잠금 3블록 (7일플랜, 리스크, 전문가Q&A) + Skeleton 블러 |
| `PlanSelector.tsx` | 훈련 Plan A/B/C 선택 (Radio + 잠금 표시) |
