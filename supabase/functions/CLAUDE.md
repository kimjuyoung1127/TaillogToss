# supabase/functions/ — Toss S2S mTLS 전담 Edge Functions

Toss 서버 간 통신(mTLS)은 반드시 여기서 처리. FastAPI에 mTLS 구현 금지.

## Edge Function 목록 (4종 + 공통)

| 폴더 | 역할 | Phase | Parity |
|------|------|-------|--------|
| `login-with-toss/` | OAuth2 → PBKDF2(pepper) → Supabase Auth | 11 | AUTH-001 |
| `verify-iap-order/` | IAP 결제 검증, 6상태 분기, 멱등+서킷브레이커 | 11 | IAP-001 |
| `send-smart-message/` | Smart Message 발송, 빈도 제한, 관리자 체크 | 11 | MSG-001 |
| `grant-toss-points/` | 토스 포인트 지급, 3-step key, 에러코드 분기 | 11 | — |
| `_shared/` | 공통 유틸 (아래 상세) | 11 | — |

## _shared/ 공통 유틸 (Phase 11 예정)

| 파일 | 역할 |
|------|------|
| `mTLSClient.ts` | mTLS 클라이언트 (mock → 사업자등록 후 실제 cert/key) |
| `idempotency.ts` | 멱등키 처리 (edge_function_requests 테이블) |
| `circuitBreaker.ts` | 서킷브레이커 (연속 N회 실패 → fast-fail) |
| `rateLimiter.ts` | Rate-limit (무인증 엔드포인트 방어) |
| `piiGuard.ts` | PII 로깅 금지 필터 |
| `pepperRotation.ts` | PBKDF2 pepper 듀얼 버전 회전 |

## 보안 체크리스트

- [ ] login-with-toss: Rate-limit + Nonce + PII 로그 금지
- [ ] verify-iap-order: 멱등키 + 서킷브레이커 + 5xx만 재시도(최대2회)
- [ ] send-smart-message: 빈도 제한 (10분1회/하루3회, 22~08시 금지)
- [ ] grant-toss-points: key 1회 사용 제한 + 에러코드 분기
