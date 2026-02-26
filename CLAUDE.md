이 문서는 TaillogToss 프로젝트의 최우선 전역 규칙이다. 에이전트는 모든 작업 전에 반드시 읽고 따른다.

# TaillogToss — Toss 미니앱 프로젝트 가이드

DogCoach(Next.js PWA) → Toss 미니앱(React Native) 마이그레이션.
개 행동 교정 SaaS: ABC 기록 → 데이터 시각화 → AI 코칭.

## 저장소 경계 (MUST)

| 구분 | 경로 | 권한 |
|------|------|------|
| Write Repo | `C:\Users\ezen601\Desktop\Jason\tosstaillog` | 읽기/쓰기 |
| Read-Only Ref | `C:\Users\ezen601\OneDrive\바탕 화면\DogCoach` | 읽기 전용 — 수정 금지 |

## 에이전트 실행 규약 (MUST)

1. 코드/파일 수정 전에 변경 내용을 1~2문장으로 먼저 알린다.
2. 파일 수정 전 현재 내용을 반드시 직접 읽고 작업한다.
3. 작업 중간 진행상황을 짧게 주기적으로 공유한다.
4. 작업 완료 시 아래 **완료 포맷**으로 보고한다.
5. 모든 구현/수정 작업은 `docs/11-FEATURE-PARITY-MATRIX.md`의 Parity ID와 연결한다.
6. 모든 파일 상단에 1~3줄 기능 요약 주석을 유지한다.
7. 기존 코드(타입, 훅, 함수)를 우선 재사용하여 중복을 피한다.
8. 사용자 요청 없이 파괴적 명령(`reset --hard`, 대량 삭제 등)을 실행하지 않는다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | `@granite-js/react-native` (토스 미니앱 샌드박스) |
| UI 시스템 | TDS React Native (`@toss/tds`) — Tailwind/Radix/Framer/Next.js 도입 금지 |
| 상태 관리 | React 내장 (useState/useContext) + TanStack Query |
| 백엔드 | Supabase Edge Functions (Toss S2S mTLS 전담) + 기존 FastAPI 유지 |
| 인증 | Toss Login → Edge Function → Supabase Auth 브릿지 |
| 결제 | Toss IAP SDK (`verify-iap-order`) |
| 광고 | 토스 Ads SDK 2.0 ver2 (Rewarded/Interstitial/Banner) |
| 라우팅 | 파일 기반 라우팅 (`entrypoints/`) |

## 스킬 활용 가이드

이 프로젝트에는 3개의 Claude 스킬이 있다. **구현 전 반드시 해당 스킬을 참조**한다.

| 스킬 | 용도 | 참조 시점 |
|------|------|-----------|
| `toss_wireframes` | 19개 화면 ASCII 와이어프레임 + TDS 컴포넌트 매핑 + 5개 레이아웃 패턴 | 화면 구현 전 |
| `toss_journey` | 6개 사용자 여정, 화면 전환 테이블(33행), 상태 전환, 인게이지먼트 훅 | 네비게이션/플로우 구현 전 |
| `toss_apps` | TDS 47개 컴포넌트 카탈로그, Supabase+Toss 연동 패턴, 차트/광고/TDS 갭 대안 | 컴포넌트/API 구현 전 |

## 확정 기술 결정

### 차트: TDS BarChart + WebView 하이브리드
- Victory Native 사용 불가 (네이티브 모듈 링킹 불가, 샌드박스)
- TDS `BarChart` (단순 막대) + `@granite-js/native/react-native-webview` 내 Chart.js (Radar, Heatmap, Line)
- `lib/charts/ChartWebView.tsx` 재사용 컴포넌트 선 구축

### 광고: 토스 Ads SDK 2.0
- R1 (survey-result), R2 (analysis), R3 (coaching-result) 터치포인트
- 토스 광고 우선 → AdMob 자동 폴백
- `react-native-google-mobile-ads` 직접 사용 불가 → 토스 통합 SDK 필수

### TDS 컴포넌트 갭 대안
| 누락 패턴 | 대안 |
|-----------|------|
| Chip/Tag (인터랙티브) | `TouchableOpacity` + `Badge` 래퍼 |
| Accordion/Collapsible | `Animated.View` height 보간 커스텀 |
| DatePicker | `SegmentedControl` + `Dropdown` + `NumericSpinner` 조합 |
| Radar/Heatmap 차트 | WebView + Chart.js |
| Speech Bubble | `View` + `Shadow` + `Border` 커스텀 |

### 인증 플로우
login → welcome(최초 1회) → survey → survey-result → notification → dashboard

### 구독/결제
- PRO 월간 ₩4,900, 토큰 10회 ₩1,900, 토큰 30회 ₩4,900
- B2B 플랜은 v1에서 숨김 (Phase 7+)
- 멀티독: 무료 1마리, PRO 5마리

## 개발 가이드라인

### React Native 가드레일
- `@apps-in-toss/react-native-framework` 기준으로 작업
- TDS React Native 우선 — 외부 UI 라이브러리 신규 도입 금지
- Toss S2S mTLS는 Supabase Edge Function 전담, FastAPI에 mTLS 구현 금지
- 네이티브 모듈 직접 링킹 불가 — `@granite-js/native/*` 프리인스톨만 사용

### 레이어 의존성
- `entrypoints/` (화면) → components, lib, types 의존 가능
- `components/` → lib, types 의존 가능
- `lib/` → types만 의존 (컴포넌트 import 금지)

### 커밋 전 체크리스트
1. RN 빌드 성공 확인
2. 백엔드 모델 변경 시 프론트엔드 타입 동기화 확인
3. 새 파일/수정 파일 상단에 기능 요약 주석 확인
4. Parity ID 매핑 확인 (`docs/11-FEATURE-PARITY-MATRIX.md`)

## 완료 포맷

```
- Scope: Parity ID 목록
- Files: 변경 파일 목록
- Validation: 실행/검증 결과
- Risks: 미해결 리스크와 다음 액션
```

## 참고 문서

| 문서 | 경로 |
|------|------|
| 마스터 PRD v2.2.0 | `docs/PRD-TailLog-Toss.md` |
| B2B 확장 PRD | `docs/PRD-TailLog-B2B.md` |
| B2B 스키마 | `docs/SCHEMA-B2B.md` |
| 마이그레이션 운영 모델 | `docs/10-MIGRATION-OPERATING-MODEL.md` |
| 기능 패리티 매트릭스 | `docs/11-FEATURE-PARITY-MATRIX.md` |
| 마이그레이션 웨이브 | `docs/12-MIGRATION-WAVES-AND-GATES.md` |
| 원본 DogCoach (읽기 전용) | `C:\Users\ezen601\OneDrive\바탕 화면\DogCoach` |
