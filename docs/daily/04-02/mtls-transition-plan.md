# mTLS 실전환 계획 (2026-04-02)

## 인증서 위치
- 원본: `~/.taillogtoss-secrets/mTLS_인증서_20260402.zip`
- PII 복호화 키: `~/.taillogtoss-secrets/securityMail.html` (키 값은 해당 파일 참조)

## 전환 단계 (수동 실행 필요)

### 1. 인증서 추출
```bash
cd ~/.taillogtoss-secrets
unzip mTLS_인증서_20260402.zip
# client.crt + client.key 확인
```

### 2. Base64 인코딩 + Supabase Secrets 등록
```bash
base64 -i client.crt | tr -d '\n' > client_cert_b64.txt
base64 -i client.key | tr -d '\n' > client_key_b64.txt

# Supabase CLI로 등록
supabase secrets set MTLS_CLIENT_CERT="$(cat client_cert_b64.txt)"
supabase secrets set MTLS_CLIENT_KEY="$(cat client_key_b64.txt)"
supabase secrets set PII_DECRYPTION_KEY="<securityMail.html에서 추출>"
supabase secrets set PII_DECRYPTION_AAD="<securityMail.html에서 추출>"
```

### 3. Edge Function mock→real 전환 (3종)
- `verify-iap-order` — mTLS 클라이언트 인증 활성화
- `send-smart-message` — mTLS 클라이언트 인증 활성화
- `grant-toss-points` — mTLS 클라이언트 인증 활성화

### 4. `src/lib/security/piiEncrypt.ts` 복호화 키 연동 확인

## 보안 주의
- 인증서/키는 절대 git에 커밋하지 않음
- `.gitignore`에 `src/public/`, `securityMail*`, `*.pem`, `*.crt`, `*.key` 추가됨
- Supabase Secrets는 write-only (읽기 불가)
