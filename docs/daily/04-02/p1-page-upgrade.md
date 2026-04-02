# P1 페이지 업그레이드 (2026-04-02)

## 완료 항목

### Phase 1: `/onboarding/welcome` Ready→Done (UIUX-004)
- [x] `#F0F4FF` → `colors.blue50` 토큰화
- [x] `!isReady` SkeletonBox 로딩 추가
- [x] `tracker.onboardingStarted()` 이벤트 추가 (tracker.ts에 신규 이벤트)
- TSC: clean

### Phase 2: `/onboarding/survey-result` Ready→Done (UI-001)
- [x] `!isReady` SkeletonBox 로딩 추가
- [x] 분석 엔진 실패 시 ErrorState fallback UI
- [x] surveyData null 시 `isReady` 체크 후 리다이렉트 (순서 안정화)
- TSC: clean

### Phase 3: `/dog/add` Ready→Done (APP-001)
- [x] KeyboardAvoidingView 래퍼 추가 (iOS padding)
- [x] 품종 이름 길이 검증 (2-30자) + maxLength + 힌트 텍스트
- [x] `!isReady` SkeletonBox 로딩 추가
- TSC: clean

### Phase 4: `/settings/subscription` Ready→Done (IAP-001)
- [x] 하드코딩 hex 8건 → `colors.*` 토큰 전환
  - `#6B7280` → `colors.grey600` (4건)
  - `#9CA3AF` → `colors.grey400` (2건)
  - `#D1D5DB` → `colors.grey300` (1건)
  - `#F0F4FF` → `colors.blue50` (1건)
- [x] `fontSize: 12` → `typography.badge`
- [x] isLoading 텍스트 → SkeletonBox
- TSC: clean

### Phase 5: `/dog/switcher` QA→Done (UIUX-006)
- [x] QA 체크리스트 7항목 전부 통과 (코드 변경 없음)
  - ModalLayout, SkeletonBox 3줄, ErrorState, EmptyState
  - 선택→goBack, PRO 제한, 토큰 준수
- doc-only 전환

### Phase 6A: IAP completeProductGrant 정비
- [x] mock receipt TODO 주석 명시
- [x] grant 플로우 tracker.iapPurchaseSuccess() 추가
- TSC: clean

### Phase 6B: Ads SDK 콜백 패턴 리팩토링
- [x] `TossAdsSdk` Promise→이벤트 콜백 인터페이스 전환
- [x] `useRewardedAd` Promise chain→콜백 패턴 적용
- [x] `RewardedAdButton` hex `#FF6B35`→`colors.orange700`
- TSC: clean

### Phase 6C: 보안 자산 정리
- [x] `src/public/mTLS_인증서_20260402.zip` → `~/.taillogtoss-secrets/`
- [x] `src/public/securityMail.html` → `~/.taillogtoss-secrets/`
- [x] `.gitignore`에 `src/public/`, `securityMail*` 추가
- [x] mTLS 실전환 계획 문서 작성

## Board 상태 변경
| route | 이전 | 이후 |
|-------|------|------|
| `/onboarding/welcome` | Ready | Done |
| `/onboarding/survey-result` | Ready | Done |
| `/dog/add` | Ready | Done |
| `/settings/subscription` | Ready | Done |
| `/dog/switcher` | QA | Done |

## 결과
- Done 페이지: 11/21 (+ 1 QA) → 16/21
- TSC: all clean
- 토큰 위반: P1 전체 제거
