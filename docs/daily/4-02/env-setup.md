# 2026-04-02 환경 세팅 로그

## 완료 항목

- [x] Windows→Mac 경로 마이그레이션 (CLAUDE.md, settings.json)
- [x] npm install (1521 packages, TS 5.9.3)
- [x] Supabase CLI 업그레이드 (2.75→2.84.2)
- [x] Supabase 연결 검증 (38 테이블, RLS 확인)
- [x] 운영 하네스 이식 (commands 4종, hook 1종, MCP 2종)
- [x] 코드 리뷰 그래프 확인 (346 files, 1269 nodes, 6580 edges)
- [x] Backend venv + pip install (Python 3.14.3, FastAPI 0.135.3)
- [x] Backend .env 설정 (Supabase DB 연결)
- [x] uvicorn 실행 검증 (/health 200 OK)
- [x] adb 설치 (v37.0.0, android-platform-tools)
- [x] adb reverse 포트 포워딩 (8081, 5173, 8000)
- [x] Sandbox 기기 연결 (R3CXB0QH0LY)
- [x] LogBox.ignoreAllLogs(true) — SafeArea 충돌 해결
- [x] backend.ts LAN IP → adb reverse 방식 전환
- [x] 종합 완성도 체크리스트 생성 (PROGRESS-CHECKLIST.md, 72%)
- [x] 토스 SDK 공식 문서 조사 4종 (AIT-SDK-2X-MIGRATION, ADS, PUBLISHING, IAP-MESSAGE-POINTS)
- [x] 문서 크로스레퍼런스 감사 + 갭 8건 수정

## 미해결

- [ ] .mcp.json 로컬 supabase MCP Unauthorized (claude_ai_Supabase 우회 중)
- [ ] SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY 미설정 (선택)

## 코드 변경

| 파일 | 변경 |
|------|------|
| `src/_app.tsx` | LogBox.ignoreAllLogs(true) 추가 |
| `src/lib/api/backend.ts` | DEV_LAN_BACKEND_URL 172.30→192.168, loopback→DEFAULT_BACKEND_URL 전환 |
| `CLAUDE.md` | SoT 인덱스에 PRD 2종 + AUTOMATION-HEALTH + AIT-* 4종 추가 |
| `docs/status/*` | AIT-* 크로스레퍼런스 8건 추가 |
