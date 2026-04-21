# /ops/settings 실데이터 업그레이드 — 2026-04-21

Parity: B2B-002
Status: Done

## 구현 완료

- [x] **M1 센터 정보 수정** — `OrgInfoEditForm.tsx` 신규, `useUpdateOrg()` 훅 추가 (`useOrg.ts`)
  - Display/Edit 모드 토글, name/phone/address 수정, 저장 실패 Alert
- [x] **M2 강아지 현황** — `DogQuotaCard.tsx` 신규
  - 활성 수 / 플랜 한도 프로그레스 바, 80% 경고 (orange500)
- [x] **M3 멤버 초대 피드백** — `settings.tsx` handleInvite 개선
  - 성공/실패 Alert 피드백 추가
- [x] **M4 구독 플랜 카드** — `PlanCard.tsx` 신규
  - 플랜명/가격/만료일 표시, 업그레이드 CTA → `/settings/subscription`
- [x] **B2B_IAP_PRODUCTS 키 수정** — UPPER_CASE → snake_case (`types/b2b.ts`)
  - PlanCard 런타임 크래시 방지

## 부가 수정 (OrgBootstrap)

- [x] `OrgContext.tsx` — `isOrgLoading` 상태 추가
- [x] `_app.tsx` OrgBootstrap — role 체크 제거 (org null 버그 해결), `setOrgLoading` 연결
- [x] `ops/dog-add.tsx` — `isOrgLoading` 대기 spinner, org null → `/ops/setup` 리디렉트

## 자기리뷰

- Typecheck: PASS
- 300줄 규칙: PASS (최대 201줄)
- 보안: PASS
- 토큰 준수: PASS
- MUST 수정 1건: B2B_IAP_PRODUCTS 케이스 불일치 즉시 수정 완료

## 신규 파일

- `src/components/features/ops/OrgInfoEditForm.tsx`
- `src/components/features/ops/DogQuotaCard.tsx`
- `src/components/features/ops/PlanCard.tsx`
