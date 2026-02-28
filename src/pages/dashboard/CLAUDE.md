# dashboard/ — 메인 대시보드 + 기록

Journey B (Daily Loop < 35초): dashboard → quick-log → dashboard(갱신)

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-3, 9-4, 9-5
- 여정 흐름: `Skill("toss_journey")` Journey B

## 파일

| 파일 | 용도 | 레이아웃 |
|------|------|---------|
| `index.tsx` | 3탭(기록/분석/훈련) + DogCard + 기록 목록 + Lottie(jackie 로딩, long-dog 빈상태) | D+A (탭+목록) |
| `quick-log.tsx` | 빠른/상세 기록 바텀시트 + 칩 8개 | E (모달형) |
| `analysis.tsx` | 주간/월간/전체 분석 탭 + BarChart | D (탭형) |
