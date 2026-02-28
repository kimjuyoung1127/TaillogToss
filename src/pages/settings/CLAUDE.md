# settings/ — 설정 + 구독

Journey C (Upgrade < 2분): 트리거 → PRO 업셀 시트 → subscription → IAP → dashboard(PRO)

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-9, 11.3
- 여정 흐름: `Skill("toss_journey")` Journey C
- IAP 결제: `Skill("toss_apps")` §10

## 파일

| 파일 | 용도 | 레이아웃 |
|------|------|---------|
| `index.tsx` | 알림/AI 설정 + 계정 관리 + 로그아웃 | A (목록형) |
| `subscription.tsx` | FREE/PRO 비교 + 토큰 팩 + IAP 구매 | B (상세형) |
