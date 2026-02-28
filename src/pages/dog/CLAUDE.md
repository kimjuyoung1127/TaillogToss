# dog/ — 반려견 관리

Journey F (Multi-Dog < 10초): dashboard → switcher → 선택/추가 → dashboard

## 스킬 참조
- 와이어프레임: `Skill("toss_wireframes")` §9-8, 11.3
- 여정 흐름: `Skill("toss_journey")` Journey F

## 파일

| 파일 | 용도 | 레이아웃 |
|------|------|---------|
| `profile.tsx` | 반려견 상세 프로필 + Accordion 섹션 + Switch | C (입력폼형) |
| `switcher.tsx` | 멀티독 전환 바텀시트 + 추가 버튼 | E (모달형) |
| `add.tsx` | 반려견 등록 (survey 축소 3필드) | C (입력폼형) |
