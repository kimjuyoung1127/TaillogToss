# styles/ — 디자인 토큰 중앙 관리

TDS(Toss Design System) 기반 색상·타이포·간격 토큰.

## 스킬 참조
- TDS 컴포넌트/토큰: `Skill("toss_apps")` §3 Foundation
- 비주얼 QA: `Skill("toss_wireframes")` QA 체크리스트

## 파일

| 파일 | 용도 |
|------|------|
| `tokens.ts` | `colors` (Grey/Blue/Red/Green/Orange/Semantic), `typography` (T1~T7 + aliases), `spacing` |

## 규칙
- 모든 컴포넌트/페이지에서 `import { colors, typography, spacing } from 'styles/tokens'`
- `#hex` 하드코딩 금지 → `colors.*` 사용
- `fontSize:` 하드코딩 금지 → `...typography.*` spread 사용
- 접근성 동적 스케일을 위해 반드시 토큰 경유
