# Page: /ops/setup (Ops Setup 화면)

**Route**: `/ops/setup`
**Parity ID**: B2B-001
**Status**: Done
**Last Updated**: 2026-04-21 (KST)

## 구현 개요

B2B 조직 최초 생성 화면 (온보딩 첫 단계). org_owner/trainer 역할 유저가 센터 정보(이름+유형)를 입력하고 조직을 등록하는 진입점.

- 생성 성공 → OrgContext 갱신 → `/ops/today` 자동 이동
- B2B 가드(`requireFeature: 'b2bOnly'`)로 역할 검증

## 파일 목록

| 파일 | 역할 | 상태 |
|------|------|------|
| `src/pages/ops/setup.tsx` | 실제 구현 | Done |
| `pages/ops/setup.tsx` (루트) | thin re-export | Done |
| `src/router.gen.ts` | 라우트 등록 | auto-generated |
| `src/lib/hooks/useOrg.ts` | `useCreateOrg()` 훅 | Done |
| `src/lib/api/org.ts` | `createOrganization()` API | Done |
| `supabase/migrations/20260421100000_create_org_rpc.sql` | RPC 정의 | Done |

## 구현 상세

### UI 구성
1. **헤더** — 타이틀 + 설명 텍스트
2. **센터 이름 입력** — TextInput, 40자 제한, 유효성 검사(공백 불가)
3. **센터 유형 선택** — 4개 옵션 (daycare, hotel, training_center, hospital) 그리드 선택
4. **에러 배너** — 입력 오류 시 red50 배경 + 안내 메시지
5. **하단 CTA** — 센터 등록하기 버튼, 로딩 상태 표시

### 로직
```typescript
handleCreate = async (name, type) => {
  // 1. 유효성 검사 (trim + 공백 체크)
  // 2. createOrg.mutate({ name, type })
  // 3. 성공 → setOrg(org) + navigation('/ops/today')
  // 4. 실패 → 에러 배너 표시
}
```

### RPC (`create_organization`)
- SECURITY DEFINER 함수
- 원자적 작업: organizations INSERT + org_members INSERT (owner)
- 현재 인증된 사용자를 owner로 자동 등록
- `src/lib/api/org.ts:17` supabase.rpc() 호출

## 스타일 토큰

모든 색상/타이포그래피는 `src/styles/tokens.ts` 중앙 관리:
- 배경: `colors.background` (white)
- 텍스트: `colors.textPrimary` / `textSecondary` / `textDark` / `textTertiary`
- 버튼: `colors.primaryBlue` + `colors.grey300` (disabled)
- 에러: `colors.red500` / `colors.red50` / `colors.badgeRedBg`

## 검증 체크리스트

- [x] 페이지 가드 적용 (`requireFeature: 'b2bOnly'`)
- [x] TextInput 유효성 검사 (trim + 공백 체크)
- [x] 센터 유형 4개 옵션 구현
- [x] 로딩 상태 표시 (ActivityIndicator)
- [x] 에러 배너 표시
- [x] OrgContext 연동 (setOrg, setMembership)
- [x] 네비게이션 연동 (navigate('/ops/today'))
- [x] 디자인 토큰 준수 (색상/폰트 하드코딩 없음)
- [x] tsc 통과

## 관련 문서 링크

- B2B 스키마: `docs/ref/SCHEMA-B2B.md`
- 와이어프레임: `Skill("toss_wireframes")` §9
- 여정 흐름: `Skill("toss_journey")` Journey E (Ops)
- PAGE-UPGRADE-BOARD: 이 라우트는 Done 상태로 기록됨

## 비고

- 센터 이름 최대 40자 제한 (DB 제약 기준)
- 센터 유형 기본값: daycare
- PII 저장은 `/ops/settings`에서 별도 처리 (phone, email 암호화)
- B2B 무료 전환 정책: ops SaaS 무료 이용, AI 추천 + 광고 수익 모델 적용
