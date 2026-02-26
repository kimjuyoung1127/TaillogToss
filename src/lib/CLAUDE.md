# lib/ — 비즈니스 로직 + 유틸리티

컴포넌트 import 금지. `types/`만 의존.

## 구조

### api/ — Supabase 도메인별 API (9개)

| 파일 | 도메인 | Parity |
|------|--------|--------|
| `supabase.ts` | Supabase 클라이언트 싱글턴 | APP-001 |
| `queryKeys.ts` | TanStack Query 캐시 키 팩토리 | APP-001 |
| `auth.ts` | Toss Login → Edge Function → Supabase Auth | AUTH-001 |
| `dog.ts` | 반려견 CRUD + 환경 데이터 | APP-001 |
| `log.ts` | ABC 행동 기록 (빠른/상세) | LOG-001 |
| `coaching.ts` | AI 코칭 결과 조회/피드백 | AI-001 |
| `training.ts` | 훈련 진행 상태 CRUD | UI-001 |
| `subscription.ts` | IAP 구매 검증 (Edge Function) | IAP-001 |
| `settings.ts` | 알림 선호도, AI 페르소나 | APP-001 |
| `notification.ts` | Smart Message 발송 (Edge Function) | MSG-001 |

### hooks/ — 도메인별 커스텀 훅 (8개)

각 훅은 대응하는 `api/` 파일을 TanStack Query로 래핑.

| 파일 | 주요 export |
|------|------------|
| `useAuth.ts` | `useLogin()`, `useLogout()` |
| `useDogs.ts` | `useDogList()`, `useDogDetail()`, `useCreateDogFromSurvey()`, `useDeleteDog()` |
| `useLogs.ts` | `useLogList()`, `useDailyLogs()`, `useCreateQuickLog()`, `useCreateDetailedLog()` |
| `useCoaching.ts` | `useCoachingList()`, `useLatestCoaching()`, `useSubmitFeedback()` |
| `useTraining.ts` | `useTrainingProgress()`, `useStartTraining()`, `useCompleteStep()` |
| `useSubscription.ts` | `useCurrentSubscription()`, `useIsPro()`, `usePurchaseIAP()` |
| `useSettings.ts` | `useUserSettings()`, `useUpdateSettings()` |
| `useNotification.ts` | `useNotificationHistory()` |

### charts/ — WebView + Chart.js (3개)

| 파일 | 용도 |
|------|------|
| `ChartWebView.tsx` | WebView 래퍼 (TODO: @granite-js/native 연결) |
| `generateChartHTML.ts` | Radar/Heatmap/Bar/Line HTML 생성 |
| `transformers.ts` | BehaviorLog[] → 차트 데이터 변환 |

### guards/ — Phase 10 예정

`authGuard`, `onboardingGuard`, `featureGuard`, `deepEntry`

### analytics/ — Phase 10 예정

이벤트 트래커 (7개 이벤트)

### data/ — Phase 8 예정

커리큘럼 정적 데이터 (7종 x 5~6일 x 3스텝)

### security/ — Phase 11 예정

PII 가드, rate-limit 유틸 (Edge Function용)
