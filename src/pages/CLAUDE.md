# pages/ — 라우트 페이지 컴포넌트

`createRoute()`로 등록하는 실제 화면. 루트 `../pages/`에는 thin re-export가 있어야 한다.

## 스킬 참조
- 화면 와이어프레임: `Skill("toss_wireframes")`
- 사용자 여정/전환 흐름: `Skill("toss_journey")`
- TDS 컴포넌트/디자인 토큰: `Skill("toss_apps")`

## 폴더 구조

| 폴더 | 화면 | 레이아웃 패턴 |
|------|------|-------------|
| `onboarding/` | welcome, survey, survey-result, notification | B, C |
| `dashboard/` | index (3탭), quick-log, analysis | D+A, E, D |
| `coaching/` | result | B |
| `dog/` | profile, switcher, add | C, E, C |
| `training/` | academy, detail | A(Grid), B |
| `settings/` | index, subscription | A, B |
| `ops/` | today, settings | D+A, A |
| `legal/` | terms, privacy | 정적 |
| `parent/` | reports | A |
| `report/` | [shareToken] | 정적(공유) |

## 규칙
- 새 화면 추가 시 루트 `../pages/`에 thin re-export도 생성
- `router.gen.ts`는 자동 생성 — 수동 수정 금지
- 모든 데이터 페이지에 로딩/빈/에러 3상태 구현 필수
- 디자인 토큰은 `styles/tokens` import (`#hex` 하드코딩 금지)
