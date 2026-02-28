# stores/ — 전역 상태 + Context

React Context + TanStack Query 기반 전역 상태 관리.

## 스킬 참조
- 인증 흐름: `Skill("toss_apps")` §4~5
- 사용자 여정 상태: `Skill("toss_journey")`

## 파일

| 파일 | 용도 |
|------|------|
| `AuthContext.tsx` | Toss 인증 상태 (user, session, login/logout) |
| `ActiveDogContext.tsx` | 현재 선택된 반려견 (멀티독 전환) |
| `OrgContext.tsx` | B2B 조직 컨텍스트 + 역할 판별 (`isB2BRole`) |
| `SurveyContext.tsx` | 설문 7단계 임시 상태 |
| `QueryProvider.tsx` | TanStack Query 클라이언트 Provider |
| `queryClient.ts` | QueryClient 싱글턴 설정 |
| `postLoginRedirect.ts` | 로그인 후 딥링크 복원 |

## 규칙
- Context는 `_app.tsx`에서 Provider 래핑
- `lib/`와 `types/`만 import 가능 (`components/`, `pages/` 금지)
