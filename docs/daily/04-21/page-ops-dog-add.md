# Page: /ops/dog-add (Ops Dog Add 화면)

**Route**: `/ops/dog-add`
**Parity ID**: B2B-001
**Status**: Done
**Last Updated**: 2026-04-21 (KST)

## 구현 개요

B2B 센터에서 신규 강아지를 등록하는 화면. org_owner/org_staff 역할 유저가 강아지 정보(이름, 견종, 성별, 보호자명)를 입력하고 반을 할당하여 등록하는 화면.

- 생성 성공 → 강아지 목록 갱신 → `/ops/today` 자동 이동
- B2B 가드(`requireFeature: 'b2bOnly'`)로 역할 검증
- 센터 강아지 등록 API(`createOrgDog()`)는 dogs INSERT → enrollDog 순차 처리

## 파일 목록

| 파일 | 역할 | 상태 |
|------|------|------|
| `src/pages/ops/dog-add.tsx` | 실제 구현 | Done |
| `pages/ops/dog-add.tsx` (루트) | thin re-export | Done |
| `src/router.gen.ts` | 라우트 등록 | auto-generated |
| `src/lib/hooks/useOrg.ts` | `useCreateOrgDog()` 훅 | Done |
| `src/lib/api/org.ts` | `createOrgDog()` API | Done |

## 구현 상세

### UI 구성
1. **헤더** — 타이틀 + 설명 텍스트
2. **강아지 이름 입력** — TextInput, 유효성 검사(공백 불가)
3. **견종 선택** — 드롭다운 또는 일반 텍스트 입력 (재사용 가능)
4. **성별 선택** — 2개 옵션 (male, female) 라디오/세그먼트
5. **보호자명 입력** — TextInput, 유효성 검사(공백 불가)
6. **반 할당** — 드롭다운 또는 선택 UI (조직의 반 목록)
7. **에러 배너** — 입력 오류 시 red50 배경 + 안내 메시지
8. **하단 CTA** — 강아지 등록하기 버튼, 로딩 상태 표시

### 로직
```typescript
handleCreate = async (name, breed, sex, parentName, classId) => {
  // 1. 유효성 검사 (trim + 공백 체크)
  // 2. useCreateOrgDog().mutate({ name, breed, sex, parentName, classId })
  // 3. 성공 → 강아지 목록 갱신 (variables.org_id 캐시 무효화) → navigation('/ops/today')
  // 4. 실패 → 에러 배너 표시
}
```

### API (`createOrgDog`)
- `src/lib/api/org.ts:73` 신규 함수
- dogs INSERT (이름, 견종, 성별) → enrollDog RPC 호출 (반 할당)
- 원자적 작업: 강아지 생성 + 반 등록 순차 처리
- 성공 시 전체 강아지 목록 반환(vacancies 포함)

### Hook (`useCreateOrgDog`)
- `src/lib/hooks/useOrg.ts` 신규 훅
- TanStack Query 기반 mutation 훅
- `onSuccess` 콜백: `variables.org_id` 키로 강아지 목록 캐시 무효화
- invalidateQueries 패턴으로 `/ops/today` FlatList 자동 갱신

### `/ops/today` FAB 연동
- `src/pages/ops/today.tsx:FAB` 신규 버튼
- 라벨: "강아지 등록"
- 벌크 모드 중(`isBulkMode=true`) 숨김 (UI 복잡성 회피)
- 클릭 시 `/ops/dog-add` 네비게이션

## 스타일 토큰

모든 색상/타이포그래피는 `src/styles/tokens.ts` 중앙 관리:
- 배경: `colors.background` (white)
- 텍스트: `colors.textPrimary` / `textSecondary` / `textDark` / `textTertiary`
- 버튼: `colors.primaryBlue` + `colors.grey300` (disabled)
- 에러: `colors.red500` / `colors.red50` / `colors.badgeRedBg`

## 검증 체크리스트

- [x] 페이지 가드 적용 (`requireFeature: 'b2bOnly'`)
- [x] TextInput 유효성 검사 (trim + 공백 체크)
- [x] 견종 선택 UI 구현
- [x] 성별 선택 UI 구현 (male/female)
- [x] 반 할당 드롭다운 구현 (조직의 반 목록)
- [x] 로딩 상태 표시 (ActivityIndicator)
- [x] 에러 배너 표시
- [x] useCreateOrgDog() 훅 연동
- [x] 네비게이션 연동 (navigate('/ops/today'))
- [x] FAB 버튼 추가 (`/ops/today`)
- [x] 디자인 토큰 준수 (색상/폰트 하드코딩 없음)
- [x] tsc 통과

## 관련 문서 링크

- B2B 스키마: `docs/ref/SCHEMA-B2B.md`
- 와이어프레임: `Skill("toss_wireframes")` §9 (Ops)
- 여정 흐름: `Skill("toss_journey")` Journey E (Ops)
- PAGE-UPGRADE-BOARD: 이 라우트는 Done 상태로 기록됨

## 비고

- 강아지 이름 최대 40자 제한 (권장)
- 견종 최대 50자 제한 (재사용 가능 데이터)
- 보호자명 암호화 저장 (PII) — 스키마 참조
- 반 할당은 필수(반이 없으면 조기 return)
- 강아지 생성 성공 후 `/ops/today`로 자동 이동하며 FlatList는 캐시 무효화로 최신 목록 표시
