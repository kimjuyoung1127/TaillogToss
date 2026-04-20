# 2026-04-20 — DB 이전 + mTLS 인증서 갱신

## 작업 범위

- [x] 신규 Supabase 프로젝트 생성 (`gxvtgrcqkbdibkyeqyil`) — Toss 미니앱 전용 DB 분리
- [x] 기존 DB (`kvknerzsqgmmdmyxlorl`, 웹+앱 혼용) 에서 완전 독립
- [x] 마이그레이션 SQL 신규 작성 (`supabase/migrations/20260420000000_toss_project_init.sql`)
  - 38 테이블 + 13 ENUM + 헬퍼 함수 7종 + 인덱스 + RLS
  - 웹 전용 컬럼 제거: `kakao_sync_id`, `pg_provider`, `pg_customer_key`
- [x] 신규 DB 초기화 후 마이그레이션 적용 완료
- [x] mTLS 인증서 신규 발급 (`mTLS_인증서_20260420.zip`)
  - `TOSS_CLIENT_CERT_BASE64` / `TOSS_CLIENT_KEY_BASE64` 신규 프로젝트 Secrets 등록
- [x] Supabase Secrets 14종 전체 등록
  - `SUPER_SECRET_PEPPER` / `SUPER_SECRET_PEPPER_V1` / `V2`
  - `AUTH_BRIDGE_SECRET`
  - `TOSS_CALLBACK_AUTH_ID` / `TOSS_CALLBACK_AUTH_PW` (콘솔 기존값 일치)
  - `TOSS_PII_DECRYPTION_KEY_BASE64` / `TOSS_PROFILE_DECRYPTION_KEY_BASE64`
- [x] Edge Functions 7종 신규 프로젝트에 재배포
- [x] `src/lib/api/supabase.ts` 새 URL/anon key 반영
- [x] `.env` / `Backend/.env` 새 프로젝트 값 반영
- [x] `toss-disconnect` ping 응답 버그 수정 (빈 body → 400 → 200 pong으로 변경)
- [x] Toss 콘솔 약관 URL 신규 URL 갱신 확인
- [x] 콜백 URL 신규 프로젝트 반영

## 잔여
- [ ] Toss 콘솔 콜백 검증 버튼 최종 통과 확인 (toss-disconnect ping 수정 후)
- [ ] 실기기 login-with-toss happy-path 200 재증적
