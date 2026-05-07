# 2026-05-05 coaching/result + IAP E2E 작업 로그

## 상태: InProgress

## 완료 항목

- [x] IAP E2E: `verify-iap-order` Edge Function에 `activateSubscription()` 추가
- [x] IAP E2E: `subscriptions_user_id_key` UNIQUE 제약 적용 (migration drift → SQL 직접 적용)
- [x] IAP E2E: `subscriptions.is_active=true, plan_type=PRO_MONTHLY, next_billing_date=2026-06-03` 확인
- [x] `toss-iap-proxy-ops` 스킬 Pattern 5 (subscriptions 활성화 E2E) 추가
- [x] `check_user_daily_limit` 0 버그 fix 1: 테이블 오류(`AIRecommendationSnapshot` → `ai_coaching JOIN dogs`)
- [x] `check_user_daily_limit` 0 버그 fix 2: timezone 오류(KST 기준 `today_start`)
- [x] FastAPI 재기동 (port 8765, health 200)
- [x] 코칭 결과/히스토리/대시보드 프리뷰의 트렌드 이모지 아이콘을 `ICONS` 이미지로 교체
- [x] PRO 잠금 블록 대표 아이콘, 위험도 dot, 전문가 카드 아이콘을 `ICONS` 이미지/토큰 색상으로 교체
- [x] 코칭 생성 실패/empty fallback의 텍스트 이모지를 `ICONS['ic-coaching']`, `ICONS['illust-empty-coaching']`으로 교체
- [x] `SpeechBubble`, `EmptyState`, `ErrorState`, `ErrorBoundary` 공통 fallback을 커스텀 이미지 기반으로 정리
- [x] ADB 실기기 `/coaching/result` 렌더링 확인 (`/tmp/taillog-coaching-result-icons.png`)
- [x] 2026-05-06 follow-up: `메이의 마음` 말풍선 텍스트 표시 누락 방지 fallback/layout 보강 + 실기기 표시 확인 (`/tmp/taillog-coaching-result-dog-voice-visible-2.png`)

## 미완료 항목

- [ ] 앱에서 `행동분석 1/10회` 실 확인
- [x] coaching/result 6블록 실 렌더링 확인
- [x] dog_voice 말풍선 텍스트 실기기 렌더링 확인
- [ ] 실기기 결제 UI 3시나리오 최종 증적

## 관련 Parity

- AI-001: coaching daily limit bug fix
- UIUX-005: coaching result custom icon cleanup
- UI-001: shared empty/error/speech fallback custom icon cleanup
- IAP-001: subscriptions 활성화 E2E
