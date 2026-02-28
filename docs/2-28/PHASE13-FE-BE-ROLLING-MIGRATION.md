# Phase 13 FE-BE Rolling Migration (2026-02-28)

## Scope
- Parity: AUTH-001, APP-001, AI-001, LOG-001, B2B-001
- Goal: Big-bang 없이 도메인별 순차 전환 + 즉시 검증

## Baseline
- typecheck: pass (2026-02-28)
- app tests (auth/iap/roleGuard/useRewardedAd): pass (28/28)
- edge tests (login-with-toss/verify-iap-order 포함): pass (23/23)

## Work Plan
1. AUTH/온보딩 블로커 해소
- [x] login-with-toss 응답 user.id를 UUID 세션 사용자로 정렬
- [x] login-with-toss에서 Supabase auth session 토큰 발급 경로 추가
- [x] public.users upsert 연동 (toss_user_key, pepper_version, last_login_at)
- [x] login-with-toss Edge Function v12 재배포 (MCP deploy)
- [x] dogs/dog_env RLS write 정책 추가 마이그레이션 + DB 반영
- [x] 설문 저장 실패 원인 노출(에러 메시지 표시)

2. API 정합성 우선 수정
- [x] dog_env 테이블명 정합화 (`dog_envs` -> `dog_env`)
- [x] coaching 테이블명 정합화 (`coaching_results` -> `ai_coaching`)

3. FE→BE 공통 기반
- [x] `src/lib/api/backend.ts` 추가 (JWT 헤더 + 에러 표준화 + fallback)
- [x] coaching API를 backend 우선 + supabase fallback 구조로 전환
- [x] org dogs API를 backend 우선 + supabase fallback 구조로 전환

4. 남은 도메인 전환 (다음 커밋)
- [ ] dashboard
- [x] log
- [x] report
- [ ] training
- [x] settings
- [x] subscription
- [x] notification

## Validation Checklist
- [x] `npm run typecheck`
- [x] `jest` app 핵심 4 suite
- [x] `jest` edge suite
- [x] Supabase Edge Function `login-with-toss` v12 배포 확인 (`get_edge_function`)
- [ ] Sandbox 실기기: survey 완료 -> survey-result -> notification -> dashboard

## Risks
- Supabase auth/user bridge는 `SUPABASE_SERVICE_ROLE_KEY` 환경 의존
- Backend URL 미설정 시 fallback 경로 동작에 의존
- training/dashboard는 FE 모델 차이로 backend 전환 시 회귀 위험이 있어 별도 설계 필요

## Rollback
- FE API fallback 유지(backend 실패 시 supabase 경로)
- 문제 시 `login-with-toss`를 이전 버전으로 롤백 배포
- 신규 RLS 정책은 정책 단위 DROP으로 롤백 가능

## Self-Review (interim)
- 잘한 점: uuid 블로커를 Edge v12 배포까지 닫고, log/report/settings/subscription/notification를 backend-first로 확대함
- 부족한 점: training/dashboard 도메인은 모델 정합 설계 없이 전환하면 회귀 가능성이 큼
- 남은 공백: 실기기 E2E(설문 완료→대시보드) 증적 및 training/dashboard 전환 설계/검증 필요
