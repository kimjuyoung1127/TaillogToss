# 2026-04-22 작업 로그 — DogPhotoPicker + Dashboard 사진 연동

## 목표
- DogPhotoPicker 실 SDK 연동 및 테스트
- 대시보드 DogCard 이모지 → 실 사진 교체
- Survey Step1Profile DogPhotoPicker 구현 검증

## 체크리스트

### DogPhotoPicker (UIUX-006)
- [x] `fetchAlbumPhotos` 실 SDK 연동 (`@apps-in-toss/native-modules`)
- [x] 권한 3단계: getPermission → openPermissionDialog → Alert
- [x] `FetchAlbumPhotosPermissionError` import 경로 수정 (`@apps-in-toss/types`)
- [x] 로딩 상태 (`ActivityIndicator`) 구현
- [x] 앱 테스트: "갤러리 접근 필요" Alert 정상 표시 확인

### DogCard 대시보드 사진 (UIUX-006)
- [x] `DashboardDog` Pick에 `profile_image_url` 추가
- [x] `profile_image_url` 있으면 `<Image>`, 없으면 🐕 이모지 폴백
- [x] `Image` import 추가, `avatarImage` 스타일 추가
- [x] 앱 즉시 반영 확인 (진돗개 사진 대시보드 표시)

### Survey Step1Profile 검증
- [x] DogPhotoPicker 정확히 구현됨 확인 (uri + onSelect 연결)

### 코드 품질 (Self-Review 후 조치)
- [x] `_app.tsx` DevMenu 미사용 import 제거 (TS6133 해결)
- [x] DevMenu 하드코딩 색상 5개 → tokens.ts 토큰화
- [x] `tokens.ts` dev 전용 토큰 추가 (`devWarningBg`, `devWarningText`)
- [x] Backend trailing whitespace 제거 (config.py, security.py)
- [x] tsc --noEmit PASS

## 변경 파일
- `src/components/features/dog/DogPhotoPicker.tsx`
- `src/components/features/dashboard/DogCard.tsx`
- `src/styles/tokens.ts`
- `src/components/shared/DevMenu.tsx`
- `src/_app.tsx`

## Status
Board: `/dashboard` → Done (2026-04-22), `/dog/profile` → Done (2026-04-22)
