---
name: toss_wireframes
description: TaillogToss 19개 화면 와이어프레임(ASCII) + TDS 컴포넌트 매핑 + 5가지 공통 레이아웃 패턴.
---

# TaillogToss 화면 와이어프레임

DogCoach(Next.js) → TaillogToss(React Native) 마이그레이션 대상 화면의 와이어프레임.
각 와이어프레임은 TDS 컴포넌트 조합으로 구성된다. TDS 상세는 `/toss_apps` Section 3 참조.
화면 간 전환 흐름(사용자 여정)은 `/toss_journey` 참조.

---

## 9-1. login.tsx — Toss OAuth 브릿지

```
┌─────────────────────────┐
│                         │
│       [Asset: Logo]     │
│    "테일로그에 오신 걸    │
│     환영합니다"          │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  토스로 시작하기    │  │  ← Button(primary, full-width)
│  └───────────────────┘  │
│                         │
│   이용약관 · 개인정보    │  ← TextButton × 2
└─────────────────────────┘
```

**사용 컴포넌트**: `Asset`, `Button`, `TextButton`
**로직**: `appLogin()` → Edge Function(`login-with-toss`) → `setSession()` → onboarding or dashboard

---

## 9-2. onboarding/survey.tsx — 7단계 반려견 설문

```
┌─────────────────────────┐
│ ← (BackButton)          │  ← Navbar.BackButton
│ ■■■■■□□  3/7            │  ← ProgressBar(value=3/7)
├─────────────────────────┤
│                         │
│ "반려견의 이름을          │
│  알려주세요"             │
│                         │
│ ┌───────────────────┐   │
│ │ 이름 입력           │   │  ← TextField(label="이름")
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 품종 선택           │   │  ← Dropdown(options=breeds)
│ └───────────────────┘   │
│                         │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │     다음           │  │  ← BottomCTA > Button
│  └───────────────────┘  │
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton)`, `ProgressBar`, `TextField`, `Dropdown`, `Radio`, `Checkbox`, `BottomCTA`, `Button`
**스텝 구성**: 이름 → 품종 → 나이 → 체중 → 중성화 → 문제행동 선택 → 목표 설정
**팁**: 각 스텝은 동일 레이아웃에 입력 컴포넌트만 교체. `SegmentedControl`로 선택형 스텝 구현 가능.

---

## 9-3. dashboard/index.tsx — 메인 대시보드

```
┌─────────────────────────┐
│ 테일로그     [🔔] [⚙️]   │  ← Navbar(.Title, IconButton×2)
├─────────────────────────┤
│ [기록] [분석] [훈련]     │  ← Tab(3개 탭)
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 🐕 뽀삐  ▸        │   │  ← ListRow(.Icon, .Texts, .RightTexts)
│ │ 오늘 기록 3건      │   │     Badge("3", variant="info")
│ └───────────────────┘   │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  ← Border
│ ┌───────────────────┐   │
│ │ 📋 최근 ABC 기록   │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 짖음 → 산책 중     │   │  ← ListRow × N (스크롤)
│ │ 14:30  Badge:높음  │   │     Badge("높음", variant="danger")
│ ├───────────────────┤   │
│ │ 점프 → 손님 방문   │   │
│ │ 10:15  Badge:보통  │   │
│ └───────────────────┘   │
│                         │
│         (Skeleton)      │  ← Skeleton(pattern="topList") 로딩 시
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │   + 빠른 기록      │  │  ← BottomCTA > Button(primary)
│  └───────────────────┘  │
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.Title)`, `IconButton`, `Tab`, `ListRow(.Icon, .Texts, .RightTexts)`, `ListHeader`, `Badge`, `Border`, `Skeleton`, `BottomCTA`, `Button`
**상태**: 로딩 시 `Skeleton(pattern="topList")`, 빈 목록 시 `Result` 컴포넌트로 빈 상태 표시

---

## 9-4. dashboard/quick-log.tsx — ABC 빠른 기록

```
┌─ useBottomSheet ────────┐
│ ┌───────────────────┐   │
│ │  빠른 ABC 기록     │   │  ← ListHeader
│ └───────────────────┘   │
│                         │
│ 선행(A)                 │
│ ┌───────────────────┐   │
│ │ 어떤 상황이었나요?  │   │  ← TextField(label="선행")
│ └───────────────────┘   │
│                         │
│ 행동(B)                 │
│ ┌───────────────────┐   │
│ │ 어떤 행동을 했나요? │   │  ← TextField(label="행동")
│ └───────────────────┘   │
│                         │
│ 결과(C)                 │
│ ┌───────────────────┐   │
│ │ 결과는 어땠나요?    │   │  ← TextField(label="결과")
│ └───────────────────┘   │
│                         │
│ 강도  ○ 낮음 ● 보통 ○ 높음│  ← SegmentedControl
│                         │
│ ┌───────────────────┐   │
│ │      저장          │   │  ← Button(primary)
│ └───────────────────┘   │
└─────────────────────────┘
```

**사용 컴포넌트**: `useBottomSheet`, `ListHeader`, `TextField` × 3, `SegmentedControl`, `Button`
**로직**: 저장 시 Supabase `behavior_logs` 테이블 INSERT → 대시보드 리프레시

---

## 9-5. dashboard/analysis.tsx — 행동 분석 차트

```
┌─────────────────────────┐
│ ← 행동 분석              │  ← Navbar(.BackButton, .Title)
├─────────────────────────┤
│ [주간] [월간] [전체]     │  ← SegmentedControl
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ ▌                 │  │
│  │ ▌  ▌              │  │  ← BarChart(data=weeklyLogs)
│  │ ▌  ▌  ▌     ▌     │  │
│  │ 월 화 수 목 금 토 일│  │
│  └───────────────────┘  │
│                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  ← Border
│ ┌───────────────────┐   │
│ │ 📋 행동별 빈도     │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 짖음       12회    │   │  ← ListRow(.Texts, .RightTexts)
│ ├───────────────────┤   │
│ │ 점프        8회    │   │  ← ListRow
│ ├───────────────────┤   │
│ │ 물기        3회    │   │  ← ListRow
│ └───────────────────┘   │
│                         │
│ 📊 전체 트렌드: 개선중 ↓ │  ← BottomInfo
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton, .Title)`, `SegmentedControl`, `BarChart`, `Border`, `ListHeader`, `ListRow(.Texts, .RightTexts)`, `BottomInfo`
**데이터**: Supabase `behavior_logs` 집계 쿼리 → 차트 데이터 변환

---

## 9-6. coaching/result.tsx — AI 코칭 결과

```
┌─────────────────────────┐
│ ← AI 코칭 결과           │  ← Navbar(.BackButton, .Title)
├─────────────────────────┤
│  ScrollView              │
│ ┌───────────────────┐   │
│ │ 🤖 코칭 요약       │   │  ← ListHeader + Asset(icon)
│ │                   │   │
│ │ "뽀삐의 짖음 행동은 │   │  ← Paragraph (Text)
│ │  분리불안에서 기인할 │   │
│ │  가능성이 높습니다. │   │
│ │  아래 훈련을 권장   │   │
│ │  합니다."          │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 📋 권장 훈련       │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 1. 탈감작 훈련     │   │  ← ListRow(.Texts) + Badge("필수")
│ ├───────────────────┤   │
│ │ 2. 자리 훈련       │   │  ← ListRow(.Texts) + Badge("추천")
│ ├───────────────────┤   │
│ │ 3. 보상 기반 교정   │   │  ← ListRow(.Texts)
│ └───────────────────┘   │
│                         │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  훈련 시작하기     │  │  ← BottomCTA > Button(primary)
│  └───────────────────┘  │
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton, .Title)`, `ScrollView`(RN 기본), `ListHeader`, `Asset`, `Text`(Paragraph), `ListRow(.Texts)`, `Badge`, `BottomCTA`, `Button`
**로직**: Supabase Edge Function(`generate-coaching`) → OpenAI/Claude API → 결과 저장 후 표시

---

## 9-7. training/academy.tsx — 훈련 커리큘럼

```
┌─────────────────────────┐
│ ← 훈련 아카데미          │  ← Navbar(.BackButton, .Title)
├─────────────────────────┤
│ ■■■■■■□□□□  60%         │  ← ProgressBar(value=0.6)
│ "기본 과정 진행중"        │
├─────────────────────────┤
│ ┌──────┐ ┌──────┐      │
│ │ 🎯   │ │ 🦮   │      │
│ │앉아   │ │산책   │      │  ← GridList(columns=2)
│ │Badge: │ │Badge: │      │     각 셀: Asset + Text + Badge
│ │완료 ✓ │ │진행중 │      │
│ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐      │
│ │ 🐾   │ │ 🏠   │      │
│ │기다려 │ │하우스 │      │
│ │Badge: │ │Badge: │      │
│ │미시작 │ │잠금🔒 │      │
│ └──────┘ └──────┘      │
│                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  ← Border
│ ┌───────────────────┐   │
│ │ 📋 오늘의 훈련     │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 산책 훈련 Day 3    │   │  ← ListRow + Badge("D-3")
│ └───────────────────┘   │
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton, .Title)`, `ProgressBar`, `GridList`, `Asset`, `Badge`, `Border`, `ListHeader`, `ListRow`
**상태**: `Badge` variant로 완료(success)/진행중(info)/미시작(default)/잠금(disabled) 표현

---

## 9-8. dog/profile.tsx — 반려견 프로필

```
┌─────────────────────────┐
│ ← 반려견 프로필           │  ← Navbar(.BackButton, .Title)
├─────────────────────────┤
│        ┌─────┐          │
│        │ 📷  │          │  ← Asset(type="image", circular)
│        │프로필│          │     TouchableOpacity → 이미지 변경
│        └─────┘          │
│                         │
│ ┌───────────────────┐   │
│ │ 이름     [뽀삐   ]│   │  ← TextField(label="이름")
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 품종     [비숑   ]│   │  ← TextField(label="품종")
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 나이     [3살    ]│   │  ← TextField(label="나이")
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 체중     [5.2 kg ]│   │  ← TextField(label="체중")
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 중성화 여부    [●]│   │  ← Switch
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 알림 받기      [●]│   │  ← Switch
│ └───────────────────┘   │
│                         │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │      저장          │  │  ← BottomCTA > Button(primary)
│  └───────────────────┘  │
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton, .Title)`, `Asset`, `TextField` × 4, `Switch` × 2, `BottomCTA`, `Button`
**검증**: 필수 필드(이름, 품종) 미입력 시 `TextField(error="필수 항목입니다")`, Button disabled 처리

---

## 9-9. settings.tsx — 설정

```
┌─────────────────────────┐
│ ← 설정                   │  ← Navbar(.BackButton, .Title)
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 📋 알림 설정       │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 푸시 알림      [●] │   │  ← ListRow + Switch
│ ├───────────────────┤   │
│ │ 훈련 리마인더  [●] │   │  ← ListRow + Switch
│ ├───────────────────┤   │
│ │ 코칭 알림      [○] │   │  ← ListRow + Switch
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 📋 계정           │   │  ← ListHeader
│ ├───────────────────┤   │
│ │ 프로필 편집     ▸  │   │  ← ListRow(.Texts, .RightTexts)
│ ├───────────────────┤   │
│ │ 이용약관        ▸  │   │  ← ListRow
│ ├───────────────────┤   │
│ │ 개인정보 처리방침 ▸│   │  ← ListRow
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 로그아웃            │   │  ← TextButton(color="danger")
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 회원탈퇴            │   │  ← TextButton(color="danger")
│ └───────────────────┘   │     → useDialog(확인 다이얼로그)
│                         │
│ v1.0.0                  │  ← BottomInfo
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.BackButton, .Title)`, `ListHeader`, `ListRow`, `Switch`, `TextButton`, `useDialog`, `BottomInfo`
**로직**: 회원탈퇴 시 `useDialog` → 확인 → Supabase Auth `deleteUser()` → 로그인 화면 이동

---

## 9-10. ops/today.tsx — B2B Ops Queue (트레이너/관리자용)

```
┌─────────────────────────┐
│ Ops 대시보드    [👤 관리자]│  ← Navbar(.Title) + Badge("관리자")
├─────────────────────────┤
│ [대기중] [진행중] [완료]  │  ← Tab(3개 탭)
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 🐕 뽀삐 / 김지영  │   │  ← ListRow(.Icon, .Texts)
│ │ "짖음 문제"       │   │     Badge("긴급", variant="danger")
│ │ 14:30 접수        │   │
│ ├───────────────────┤   │
│ │ 🐕 초코 / 박민수  │   │  ← ListRow
│ │ "산책 교정"       │   │     Badge("일반", variant="info")
│ │ 13:00 접수        │   │
│ ├───────────────────┤   │
│ │ 🐕 루비 / 이수진  │   │  ← ListRow
│ │ "분리불안"        │   │     Badge("대기", variant="warning")
│ │ 11:30 접수        │   │
│ └───────────────────┘   │
│                         │
│ FlatList (무한 스크롤)    │  ← RN FlatList + Loader
│                         │
│ 총 12건 / 오늘 완료 5건  │  ← BottomInfo
└─────────────────────────┘
```

**사용 컴포넌트**: `Navbar(.Title)`, `Badge`, `Tab`, `ListRow(.Icon, .Texts)`, `FlatList`(RN 기본), `Loader`, `BottomInfo`
**권한**: `role IN ('trainer', 'admin')` RLS 정책 필수. 일반 사용자 접근 시 `ErrorPage` 표시

---

## 공통 레이아웃 패턴 (5가지)

화면 구현 시 아래 5가지 기본 패턴 중 하나를 베이스로 조합한다.

### 패턴 A: 목록형

```
┌─────────────────────────┐
│ Navbar                  │
├─────────────────────────┤
│ ListHeader              │
│ ListRow                 │
│ ListRow                 │
│ ListRow   (FlatList)    │
│ ...                     │
├─────────────────────────┤
│ BottomInfo              │
└─────────────────────────┘
```

**구조**: `Navbar` + `ListHeader` + `ListRow`(반복, `FlatList`/`ScrollView`) + `BottomInfo`
**사용 화면**: dashboard/index, ops/today, settings

### 패턴 B: 상세형

```
┌─────────────────────────┐
│ Navbar(.BackButton)     │
├─────────────────────────┤
│ ScrollView              │
│  ┌─────────────────┐   │
│  │ 콘텐츠 (Text,   │   │
│  │ Asset, ListRow)  │   │
│  └─────────────────┘   │
├─────────────────────────┤
│ BottomCTA > Button      │
└─────────────────────────┘
```

**구조**: `Navbar(.BackButton)` + `ScrollView` + 콘텐츠(`Text`, `Asset`, `ListRow` 등) + `BottomCTA`
**사용 화면**: coaching/result, welcome, survey-result, subscription, training-detail

### 패턴 C: 입력폼형

```
┌─────────────────────────┐
│ Navbar(.BackButton)     │
├─────────────────────────┤
│ ProgressBar (선택)      │
│                         │
│ TextField               │
│ TextField               │
│ Dropdown / Switch       │
│ ...                     │
├─────────────────────────┤
│ BottomCTA > Button      │
└─────────────────────────┘
```

**구조**: `Navbar(.BackButton)` + (선택)`ProgressBar` + `TextField`(들) + `BottomCTA`
**사용 화면**: onboarding/survey, dog/profile, dog/add

### 패턴 D: 탭형

```
┌─────────────────────────┐
│ Navbar                  │
├─────────────────────────┤
│ Tab                     │
├─────────────────────────┤
│ 콘텐츠 영역              │
│ (탭별 다른 콘텐츠)       │
├─────────────────────────┤
│ BottomCTA (선택)        │
└─────────────────────────┘
```

**구조**: `Navbar` + `Tab` + 컨텐츠영역 + (선택)`BottomCTA`
**사용 화면**: dashboard/index, dashboard/analysis, ops/today

### 패턴 E: 모달형 (BottomSheet)

```
┌─ useBottomSheet ────────┐
│ ListHeader              │
│                         │
│ 콘텐츠 (TextField,      │
│  ListRow, Button 등)    │
│                         │
│ Button (primary)        │
└─────────────────────────┘
```

**구조**: `useBottomSheet` + `ListHeader` + 콘텐츠(`ListRow`/`TextField`/`Button` 등)
**사용 화면**: dashboard/quick-log, dog-switcher, 필터/정렬 모달

---

### 패턴 조합 가이드

| 화면 | 기본 패턴 | 추가 조합 |
|------|----------|----------|
| login.tsx | — (단독) | `Asset` + `Button` + `TextButton` |
| onboarding/welcome.tsx | B (상세형) | `Carousel` + `Asset`(Lottie) |
| onboarding/survey.tsx | C (입력폼형) | `ProgressBar` + 스텝별 입력 교체 |
| onboarding/survey-result.tsx | B (상세형) | `Skeleton`(블러) + `Badge` + 광고 CTA |
| onboarding/notification.tsx | B (상세형) | `Checkbox` × 3 + `Asset`(Lottie) |
| dashboard/index.tsx | D (탭형) + A (목록형) | `Tab` 내부에 `ListRow` 반복 |
| dashboard/quick-log.tsx | E (모달형) | `SegmentedControl`(빠른/상세) + 칩/Accordion |
| dashboard/analysis.tsx | D (탭형) | `BarChart` + `ListRow` 목록 |
| coaching/result.tsx | B (상세형) | `ScrollView` + 진단 중심 6블록 |
| training/academy.tsx | A (목록형) 변형 | `GridList` + `ProgressBar` |
| training/detail.tsx | B (상세형) | `Checkbox`(체크리스트) + `TextField`(메모) |
| dog/profile.tsx | C (입력폼형) | `Asset`(프로필) + `Switch` |
| dog/switcher.tsx | E (모달형) | `ListRow` × N + `Badge`("선택") |
| dog/add.tsx | C (입력폼형) | survey 축소판 (3필드) |
| settings/index.tsx | A (목록형) | `Switch` + `useDialog` |
| settings/subscription.tsx | B (상세형) | `TableRow`(비교) + `BoardRow`(플랜) + IAP |
| ops/today.tsx | D (탭형) + A (목록형) | `FlatList` 무한스크롤 + 프리셋/ABC 기록 모달 |
