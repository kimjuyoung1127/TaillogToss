# TaillogToss 에셋 가이드

## 1. Lottie 애니메이션 (복사 완료)

DogCoach에서 재사용. `src/assets/lottie/`에 위치.

| 파일 | 원본 | 크기 | 용도 | 적용 화면 |
|------|------|------|------|----------|
| `cute-doggie.json` | DogCoach `Cute Doggie.json` | 57KB | 걷는 강아지 | welcome, 온보딩 로딩 |
| `jackie.json` | DogCoach `Jackie.json` | 81KB | 걷는 강아지 (상세) | 대시보드 로딩 |
| `long-dog.json` | DogCoach `Long Dog.json` | 54KB | 닥스훈트 스타일 | 빈 상태 (로그/코칭) |
| `happy-dog.json` | Downloads `Happy Dog.lottie` | 26KB | 행복한 강아지 | B2B 빈 상태 / 보호자 리포트 빈 상태 |
| `perrito-corriendo.json` | Downloads `PerritoCorriendo.lottie` | 26KB | 달리는 강아지 | 생성 로딩 (코칭/리포트 생성 중) |

**사용법**: `LottieAnimation` 컴포넌트 (`src/components/shared/LottieAnimation.tsx`)
```tsx
import { LottieAnimation } from 'components/shared/LottieAnimation';
<LottieAnimation asset="happy-dog" size={200} />
<LottieAnimation asset="perrito-corriendo" size={160} />
```

새 파일 추가 시 `LottieAnimation.tsx`의 `LOTTIE_SOURCES`에 등록.

## 2. 필요 이미지 목록

V1 출시에 필요한 정적 이미지/일러스트 목록.

### 2-1. 필수 (V1 출시 전)

| # | 용도 | 종류 | 크기 | 배치 경로 | 비고 |
|---|------|------|------|----------|------|
| 1 | 앱 아이콘 | PNG | 1024x1024 + 다양한 사이즈 | `src/assets/icons/` | 토스 콘솔 등록 필수 |
| 2 | 온보딩 welcome 히어로 | SVG/PNG | 360xauto | `src/assets/images/` | Lottie `cute-doggie`로 대체 완료 |
| 3 | 빈 상태: 기록 없음 | SVG/PNG | 200x200 | `src/assets/images/` | Lottie `long-dog`으로 대체 완료 |
| 4 | 빈 상태: 코칭 없음 | SVG/PNG | 200x200 | `src/assets/icons/` | ✅ `illust-empty-coaching` 적용 완료 |
| 5 | 빈 상태: 훈련 시작 전 | SVG/PNG | 200x200 | `src/assets/icons/` | ✅ `illust-empty-training` 적용 완료 |
| 6 | 빈 상태: 등록된 강아지 없음 (B2B) | SVG/PNG | 200x200 | `src/assets/images/` | 미제작 — Ops 화면 |

### 2-2. 권장 (UX 품질 향상)

| # | 용도 | 종류 | 크기 | 비고 |
|---|------|------|------|------|
| 7 | 스트릭 배지 3일 | PNG | 64x64 | ✅ 완료 — `badge-streak-3` StreakBanner 연결 |
| 8 | 스트릭 배지 7일 | PNG | 64x64 | ✅ 완료 — `badge-streak-7` 연결 |
| 9 | 스트릭 배지 14일 | PNG | 64x64 | 미제작 (30일로 대체) |
| 10 | 스트릭 배지 30일 | PNG | 64x64 | ✅ 완료 — `badge-streak-30` 연결 |
| 11 | 구독 비교 비주얼 | SVG/PNG | 360xauto | 미제작 — FREE vs PRO 카드 |
| 12 | 에러 상태 일러스트 | SVG/PNG | 200x200 | 미제작 — 네트워크 오류 등 |

### 2-3. V2 이후

| # | 용도 | 비고 |
|---|------|------|
| 13 | 커뮤니티 빈 상태 | V2 커뮤니티 기능 |
| 14 | 달성 뱃지 세트 (10종+) | 게이미피케이션 확장 |
| 15 | 견종별 아이콘 | 프로필 커스텀 |

## 3. Lottie 대체 전략

일러스트 제작 전까지 Lottie + 이모지로 대체 가능:

| 화면 | 현재 | Lottie 대체 |
|------|------|------------|
| welcome | 🐕 이모지 | `cute-doggie` 애니메이션 |
| 대시보드 로딩 | ActivityIndicator | `jackie` 애니메이션 |
| 빈 상태 (로그) | 텍스트 | `long-dog` 애니메이션 |
| 빈 상태 (코칭) | 텍스트 | `long-dog` 애니메이션 (재사용) |
| 빈 상태 (훈련) | 텍스트 | `cute-doggie` 애니메이션 (재사용) |

## 4. 비디오

V1에서는 비디오 불필요. 훈련 상세 페이지에 교육 영상 임베드는 V2 고려.
`@granite-js/native/react-native-video` 사용 가능 (확인됨).

## 5. 디렉토리 구조

### Supabase Storage 버킷

| 버킷 | 공개 | 용도 | 업로드 함수 |
|------|------|------|------------|
| `dog-profiles` | public | 반려견 프로필 사진 | `uploadDogProfileImage(userId, dogId, fileUri)` in `lib/api/dog.ts` |

```
src/assets/
  lottie/
    cute-doggie.json    ✅ 복사 완료
    jackie.json         ✅ 복사 완료
    long-dog.json       ✅ 복사 완료
  images/               (생성 대기)
    welcome-hero.png
    empty-log.png
    empty-coaching.png
    empty-training.png
    empty-b2b.png
    error.png
  icon/                 (생성 대기)
    app-icon-1024.png
  badges/               (생성 대기)
    streak-3.png
    streak-7.png
    streak-30.png
```

## 6. 커스텀 아이콘 세트

> **2026-04-21 — 아이콘 시스템 전환 완료**
> Granite.js는 `require('./icon.png')` 로컬 에셋 미지원 (`assetRegistry.js` → undefined 반환).
> **해결책**: `src/lib/data/iconSources.ts` — 41개 아이콘을 base64 data URI로 인라인 번들.
> 사용법: `import { ICONS } from 'lib/data/iconSources'` → `source={{ uri: ICONS['ic-home']! }}`

- 저장 경로: `src/assets/icons/` (@2x, @3x 파일 원본 보관)
- **런타임 사용 경로**: `src/lib/data/iconSources.ts` (base64 인라인)
- 생성 스크립트: `scripts/generate_custom_icons.py`

### 아이콘 현황 (41개)

| 그룹 | 키 | 코드 연결 | 사용 위치 |
|------|-----|----------|---------|
| 탭/네비 | `ic-home`, `ic-training`, `ic-settings`, `ic-ops` | ✅ | BottomNavBar |
| 설문 단계 | `ic-stage-puppy/adult/senior` | ✅ | Step1Profile |
| 코칭 패턴 | `ic-search`, `ic-target`, `ic-idea`, `ic-bolt`, `ic-puzzle` | ✅ | FreeBlock |
| 코칭 UI | `ic-analysis`, `ic-paw`, `ic-report`, `ic-trainer`, `ic-coaching`, `ic-dog` | ✅ | CoachingGenerationLoader, LockedBlock, subscription |
| 빠른기록 행동 | `ic-cat-barking/aggression/anxiety/destructive/mounting/excitement/toilet/fear` | ✅ | QuickLogChips |
| 빠른기록 일상 | `ic-cat-walk/meal/train/play/rest/grooming` | ✅ | QuickLogChips |
| 스트릭 배지 | `badge-streak-3/7/30` | ✅ | StreakBanner (3일↑/7일↑/30일↑ 마일스톤) |
| PRO 배지 | `badge-pro` | ❌ | 미연결 — subscription PRO 강조 UI 예정 |
| 빈 상태 일러스트 | `illust-empty-coaching` | ✅ | CoachingHistoryList EmptyState |
| 빈 상태 일러스트 | `illust-empty-training` | ✅ | academy EmptyState |
| 빈 상태 일러스트 | `illust-empty-log` | ❌ | 미연결 — 대시보드 빈 상태 현재 Lottie `long-dog` 사용 중 |
| 기타 | `ic-add-log`, `ic-back` | ❌ | 미연결 (FAB/네이티브 뒤로가기 대체 검토) |

### 커리큘럼 아이콘 (별도 모듈)

> **2026-04-22** — `src/lib/data/curriculumIconAssets.ts` 신규. `iconSources.ts`와 동일 base64 URI 패턴.
> `Record<CurriculumId, string>` 타입으로 7개 커리큘럼 아이콘 + 폴백 수록.
> 사용법: `import { CURRICULUM_ICON_URIS, CURRICULUM_ICON_FALLBACK_URI } from 'lib/data/curriculumIconAssets'`
> → `source={{ uri: CURRICULUM_ICON_URIS[curriculum.id] ?? CURRICULUM_ICON_FALLBACK_URI }}`

| CurriculumId | PNG 원본 | 용도 |
|---|---|---|
| `basic_obedience` | `ic-cat-toilet.png` | 기본 복종 훈련 |
| `leash_manners` | `ic-cat-walk.png` | 리드줄 산책 |
| `separation_anxiety` | `ic-cat-anxiety.png` | 분리불안 |
| `reactivity_management` | `ic-cat-barking.png` | 반응성 관리 |
| `impulse_control` | `ic-cat-excitement.png` | 충동 조절 |
| `socialization` | `ic-cat-play.png` | 사회화 |
| `fear_desensitization` | `ic-cat-fear.png` | 두려움 둔감화 |
| `__fallback__` | `ic-cat-train.png` | 폴백 |

### 새 아이콘 추가 절차

1. `@2x`, `@3x` PNG를 `src/assets/icons/`에 추가
2. `scripts/generate_custom_icons.py` 재실행 → `iconSources.ts` 재생성
3. `ICONS['새-키']!`로 참조
4. 커리큘럼 아이콘은 `curriculumIconAssets.ts`에 별도 추가 (python base64 인코딩)
