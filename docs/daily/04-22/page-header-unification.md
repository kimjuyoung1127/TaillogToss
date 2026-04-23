# 헤더 통일화 + 대시보드 로고 적용 (2026-04-22)

## 작업 범위

- `src/components/shared/layouts/ListLayout.tsx`
- `src/components/shared/layouts/TabLayout.tsx`
- `src/pages/settings/index.tsx`
- `src/pages/dashboard/index.tsx`

## 변경 내역

- [x] ListLayout — `style?(ViewStyle)` 오버라이드 prop 추가 (safe 컨테이너 bg 색상 커스터마이징)
- [x] ListLayout — `contentContainerStyle?(ViewStyle)` prop 추가 (ScrollView 패딩 오버라이드)
- [x] TabLayout — `headerLeft?: React.ReactNode` prop 추가 + `headerLeft` 스타일 rowGap 처리
- [x] settings/index.tsx — 로컬 `TopBar` 함수 제거 → `ListLayout` 교체 (로딩/에러/정상 3경로 통일)
- [x] settings/index.tsx — `SafeAreaView`, `ScrollView` import 제거, 불필요 스타일 6개 삭제
- [x] dashboard/index.tsx — `ICONS['ic-stage-adult']` base64 URI로 헤더 좌측 로고 적용 (28×28)

## 확인 사항

- tsc PASS (에러 0)
- 설정 헤더: ListLayout 타이틀 "설정" + 뒤로가기(canGoBack 조건부)
- 대시보드 헤더: 강아지 아이콘 + "테일로그" 텍스트 병렬

## 잔여 사항

- [ ] 실기기 렌더링 확인 (아이콘 사이즈 28px 적절성)
- [ ] ic-stage-adult가 동일 화면에 성장단계 표시로 중복 노출되는지 확인
