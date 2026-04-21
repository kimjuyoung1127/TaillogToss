# Feature: /dashboard B2B Role Detection Banner

**Route**: `/dashboard`
**Parity ID**: B2B-001
**Status**: Done
**Last Updated**: 2026-04-21 (KST)

## 구현 개요

B2B 역할 유저(org_owner, org_staff)가 대시보드에 접속했을 때, 상단 배너로 "/ops/today" 화면으로 이동하도록 유도하는 기능.

- 조건: `isB2BRole` 구분 + `useAuth()` 세션 확인
- UI: 배너 형태, 텍스트 + CTA 버튼 포함
- 클릭 시 `/ops/today` 네비게이션

## 파일 수정

| 파일 | 역할 | 상태 |
|------|------|------|
| `src/pages/dashboard/index.tsx` | 배너 로직 추가 | Done |

## 구현 상세

### 로직
```typescript
const { user } = useAuth();
const isB2BRole = user?.user_metadata?.roles?.includes('org_owner') ||
                  user?.user_metadata?.roles?.includes('org_staff');

if (isB2BRole) {
  // 배너 노출 + CTA 버튼
  return <B2BRoleBanner onPress={() => navigate('/ops/today')} />
}
```

### UI
- 배너 위치: 대시보드 상단 (스크롤 가능)
- 배경색: `colors.blueBg` 또는 `colors.primaryBlue` (soft)
- 텍스트: "센터 관리자 모드로 전환" 또는 "센터 운영 화면으로 이동"
- CTA 버튼: 오른쪽 화살표 아이콘 + 클릭 시 `/ops/today` 이동

### 스타일 토큰
모든 색상/타이포그래피는 `src/styles/tokens.ts` 중앙 관리:
- 배경: `colors.blueBg` 또는 `colors.primaryBlue` (투명도 적용)
- 텍스트: `colors.textPrimary` (dark)
- 버튼: `colors.primaryBlue` + 호버 상태

## 검증 체크리스트

- [x] `useAuth()` 세션 구분 로직
- [x] `isB2BRole` 역할 판정 (org_owner, org_staff)
- [x] 배너 UI 구현 (텍스트 + CTA)
- [x] 네비게이션 연동 (navigate('/ops/today'))
- [x] 디자인 토큰 준수
- [x] tsc 통과

## 관련 문서 링크

- B2B 아키텍처: `docs/ref/ARCHITECTURE-DIAGRAMS.md` (Diagram 3: Auth & Role Flow)
- 역할 구분: `docs/ref/SCHEMA-B2B.md` (roles 테이블)
- PAGE-UPGRADE-BOARD: 대시보드는 Done 상태 유지

## 비고

- B2B 역할이 없는 일반 유저(B2C)는 배너 미노출
- B2B 역할 변경 시 UI는 `useAuth()` re-render로 자동 동기화
- 배너는 선택 사항 (dismiss 버튼 추가 가능)
