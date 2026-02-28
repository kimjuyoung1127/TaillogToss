이 문서는 TaillogToss 프로젝트의 최우선 전역 규칙이다. 에이전트는 모든 작업 전에 반드시 읽고 따른다.
이 문서는 "슬림 인덱스"로 유지하고, 상태/이력 상세는 별도 기록 문서에 유지한다.

# TaillogToss 운영 인덱스 (Slim)

DogCoach(Next.js PWA) -> Toss 미니앱(React Native) 마이그레이션.
여기에는 규칙, 우선순위, 참조 경로만 유지한다.

## 저장소 경계 (MUST)

| 구분 | 경로 | 권한 |
|------|------|------|
| Write Repo | `C:\Users\gmdqn\tosstaillog` | 읽기/쓰기 |
| Read-Only Ref | `C:\Users\gmdqn\DogCoach` | 읽기 전용 |

## 에이전트 실행 규약 (MUST)
1. 수정 전 변경 계획을 1~2문장으로 먼저 알린다.
2. 수정 전 파일 원문을 반드시 읽는다.
3. 작업은 Parity ID와 연결한다.
4. 완료 보고는 아래 완료 포맷을 사용한다.
5. 사용자 요청 없는 파괴적 명령(`reset --hard`, 대량 삭제) 금지.
6. 코드 중복보다 기존 타입/훅/함수 재사용 우선.
7. 코드 파일 상단 1~3줄 기능 요약 주석 유지.
8. 반복되는 실행/검증 절차가 확인되면 기존 스킬 업데이트 또는 신규 스킬로 즉시 지침화한다.
9. 새 폴더 생성 시 해당 폴더에 `CLAUDE.md`를 만들고 역할/파일/스킬/import 규칙을 명시한다.
10. 디자인 토큰은 `styles/tokens` import 필수, `#hex`/`fontSize:` 하드코딩 금지.
11. `CLAUDE.md`는 항상 슬림 유지: 완료 항목/상세 로그/긴 표는 기록 문서로 이동하고 여기엔 링크만 남긴다.

## 스택/아키텍처 요약

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | `@granite-js/react-native` |
| UI | TDS React Native (`@toss/tds`) + `src/styles/tokens.ts` |
| 상태 | React 기본 + TanStack Query |
| 백엔드 | `Backend/` FastAPI + `supabase/functions/` Edge |
| 인증 | Toss Login -> Edge(`login-with-toss`) -> Supabase Auth bridge |
| 결제 | Toss IAP (`verify-iap-order`) |
| 광고 | Toss Ads SDK 2.0 |

- FE<->BE 매칭: `src/lib/api/*.ts` <-> `Backend/app/features/*/` 파일명 1:1
- FE->BE 전환: `src/lib/api/backend.ts` (backend-first + supabase fallback)
- 인증: 로컬 JWT 디코드(`python-jose`), Guest 모드 제거

## 스킬 참조 인덱스 (MUST)

| 주제 | 스킬 |
|------|------|
| 화면 와이어프레임/레이아웃 + 비주얼 QA | `Skill("toss_wireframes")` |
| 사용자 여정/상태 전환 | `Skill("toss_journey")` |
| Toss 앱 기본(TDS, 토큰, UX라이팅, mTLS, IAP, Ads) | `Skill("toss_apps")` |
| Growth 운영(Smart Message/Segment/Promotion/Reward/OG) | `Skill("toss-growth-ops")` |
| 수익화 운영(Ads/IAP/TossPay) | `Skill("toss-monetization-ops")` |
| 로그인 토큰 운영(OAuth2 발급/갱신/연동해제) | `Skill("toss-login-token-ops")` |
| DB 변환/마이그레이션 전략 | `Skill("toss_db_migration")` |
| Edge 보안 하드닝/우회 차단 검증 | `Skill("toss-edge-hardening")` |
| Phase 13 게이트 판정/증적 동기화 | `Skill("toss-phase13-gate")` |
| Supabase MCP 운영 표준 | `Skill("toss-supabase-mcp")` |
| Sandbox Metro 실기기 연결 | `Skill("toss-sandbox-metro")` |

## 현재 우선순위 (Last Updated: 2026-02-28)
1. IAP-001: Sandbox 결제 E2E (구매/복구/실패 3시나리오) 증적 확보
2. MSG-001: Smart Message 실발송 + `noti_history` 영속 확인
3. AD-001: 실 Ad Group ID 적용 후 R1/R2/R3 실노출 검증
4. INFRA-3: Edge 3종(`verify-iap-order`, `send-smart-message`, `grant-toss-points`) real mTLS 전환

## 상세 상태/기록 문서 (Source of Truth)

| 문서 | 용도 |
|------|------|
| `docs/PROJECT-STATUS.md` | 최신 상태판, Parity/Phase/블로커/테스트/Mock 항목 |
| `docs/11-FEATURE-PARITY-MATRIX.md` | Parity ID별 상세 Notes/검증 로그 |
| `docs/MISSING-AND-UNIMPLEMENTED.md` | 미구현 상세 + V2 후보 |
| `docs/2-27/PHASE13-E2E-SANDBOX-PLAYBOOK.md` | Sandbox 실기기 테스트 플레이북 |
| `docs/2-28/PHASE13-FE-BE-ROLLING-MIGRATION.md` | FE<->BE 롤링 마이그레이션 작업 기록 |
| `docs/BACKEND-PLAN.md` | Backend 구현 상세/엔드포인트 매핑 |
| `docs/SCHEMA-B2B.md` | B2B 10테이블 스키마 상세 |

## 완료 포맷

```
- Scope: Parity ID 목록
- Files: 변경 파일 목록
- Validation: 실행/검증 결과
- Risks: 미해결 리스크와 다음 액션
- Self-Review: 잘한 점 / 부족한 점 / 남은 검증 공백
- Next Recommendations: 다음 우선순위 1~3개
```
