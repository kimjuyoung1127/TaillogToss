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

## 자동화 에이전트 규칙 (MUST)

| 자동화 | 주기 | 내용 |
|--------|------|------|
| CLAUDE.md 슬림화 | 매일 08:00 | 완료 Parity ID 제거, 문서 테이블 갱신, Last Updated 갱신 |
| docs/ 정리·압축 | 매일 22:00 | ref/status/daily 구조 유지, 7일+ daily 폴더 weekly/로 압축 |

⚠️ 우선순위는 자동화가 매일 갱신함 — 에이전트가 수동으로 건드리지 말 것.

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
1. UIUX-001: 대시보드 분석/훈련 페이지에서 데이터 없을 때도 구조(스켈레톤/빈상태 레이아웃) 먼저 고정하고, 데이터 생성 시 즉시 표시되도록 준비
2. UIUX-002: 훈련 아카데미 커리큘럼을 기존 웹앱 방향처럼 "AI가 그때그때 생성해주는 느낌"의 UI/UX로 재구성
3. UIUX-003: 전체 커리큘럼 한눈에 보기 개선(현재 2개만 잘 보이고 나머지 가시성 낮음) + 페이지 이동 화살표 터치 영역 확대 + Toss 인앱 스와이프 가능 여부 확인 후 네비게이션 방식 확정
4. UIUX-004: Survey 화면을 기존 웹앱 내용 기준으로 정합화(목업 데이터처럼 보이는 현재 상태 해소)
5. UIUX-005: `coachingresult`, `trainingdetail` 완성도 보강(준비 미흡 항목 우선 정리)
6. UIUX-006: `dogprofile` 실데이터 표시 복구 + `dogswitcher` UI 도입
7. 보류: IAP/MSG/AD/INFRA 실행 플랜은 위 UI/UX 개선 목표 정리/반영 이후 다음 세션에서 재개

## 상세 상태/기록 문서 (Source of Truth)

docs/ 구조: `ref/`(영구참조) · `status/`(상태판) · `daily/`(작업로그, 자동압축) · `weekly/`(주간압축본)

| 문서 | 용도 |
|------|------|
| `docs/status/PROJECT-STATUS.md` | 최신 상태판, Parity/Phase/블로커/테스트/Mock 항목 |
| `docs/status/11-FEATURE-PARITY-MATRIX.md` | Parity ID별 상세 Notes/검증 로그 |
| `docs/status/MISSING-AND-UNIMPLEMENTED.md` | 미구현 상세 + V2 후보 |
| `docs/ref/BACKEND-PLAN.md` | Backend 구현 상세/엔드포인트 매핑 |
| `docs/ref/SCHEMA-B2B.md` | B2B 10테이블 스키마 상세 |
| `docs/daily/` | 날짜별 작업 로그 — 매일 22:00 자동 압축 대상 |
| `docs/weekly/` | 주간 압축본 — daily/ 7일+ 폴더 합산 결과 |

## 완료 포맷

```
- Scope: Parity ID 목록
- Files: 변경 파일 목록
- Validation: 실행/검증 결과
- Risks: 미해결 리스크와 다음 액션
- Self-Review: 잘한 점 / 부족한 점 / 남은 검증 공백
- Next Recommendations: 다음 우선순위 1~3개
```
