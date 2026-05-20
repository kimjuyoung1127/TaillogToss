# 코칭 기능 3종 개선 테스트 리포트

- **날짜**: 2026-05-20
- **대상 커밋**: `fix: 사용자 인풋 기반 맞춤 코칭 + Pro CTA 강화 + 한도 표시 수정` + 셀프리뷰 수정
- **환경**: DEV_LOCAL (Metro :8081 + FastAPI :8765)
- **Parity**: AI-001, UIUX-005, PRO-INTAKE-001

---

## 변경 범위 요약

| 파일 | 변경 내용 |
|------|---------|
| `Backend/app/features/coaching/schemas.py` | `DailyUsageResponse.limit` 기본값 3→1 |
| `Backend/app/features/coaching/prompts.py` | `user_context` 프롬프트 주입 |
| `Backend/app/features/coaching/service.py` | `user_context` → `build_user_prompt` 전달 |
| `src/lib/api/coaching.ts` | `user_context` 파라미터 추가, 429 파싱 필드 보정 |
| `src/lib/hooks/useCoaching.ts` | `userContext` mutationFn 전달 |
| `src/pages/coaching/result.tsx` | 상황 state + `buildUserContext()` + `isLatestTab` prop |
| `src/pages/coaching/CoachingDetailContent.tsx` | isLatestTab 분기, Pro CTA, proLimitInfo 스타일 |
| `src/components/features/coaching/CoachingPersonalizationBadge.tsx` | 신규 |
| `src/components/features/coaching/CoachingContextInput.tsx` | 신규 |

---

## 테스트 결과

### 영역 1: 한도 표시 버그 (schemas.py limit 기본값)

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 1-1 | 무료 유저 /usage/daily API | `{"used":N,"limit":1}` | | |
| 1-2 | 무료 유저 화면 하단 | `오늘 N/1회 사용` | | |
| 1-3 | Pro 유저 /usage/daily API | `{"used":N,"limit":10}` | | |
| 1-4 | Pro 유저 화면 하단 | `오늘 N/10회 사용` | | |

### 영역 2: Pro CTA 강화

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 2-1 | 무료 + 한도 미초과 | `새 코칭 받기` 버튼 (파란 테두리) | | |
| 2-2 | 무료 + 한도 초과 | `✨ PRO로 무제한 코칭 받기` 버튼 | | |
| 2-3 | Pro CTA 탭 → 구독 화면 이동 | `/settings/subscription` 진입 | | |
| 2-4 | Pro + 한도 초과 | `내일 다시 가능해요 🌙` 텍스트 | | |
| 2-5 | Pro + 한도 미초과 | `새 코칭 받기` 버튼 | | |

### 영역 3: 개인화 배지

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 3-1 | 최신 탭, 상황 미선택 | `최근 기록을 바탕으로 코칭해요` | | |
| 3-2 | 최신 탭, 체크박스 선택 | `기록 + 오늘 상황 반영해서 코칭해요` | | |
| 3-3 | 기록 탭 | 배지 미노출 | | |

### 영역 4: 상황 입력 UI

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 4-1 | 최신 탭, 한도 미초과 | 체크박스 6개 표시 | | |
| 4-2 | 기록 탭 전환 | 입력 UI 전체 미노출 | | |
| 4-3 | 히스토리 코칭 선택 | 입력 UI 미노출 | | |
| 4-4 | 체크박스 토글 | 파란 배경 ↔ 흰 배경 전환 | | |
| 4-5 | 무료 유저 자유입력 영역 | 오렌지 힌트 배너 | | |
| 4-6 | Pro 유저 자유입력 | TextInput 활성, 300자 제한 | | |
| 4-7 | 한도 초과 시 | 체크박스 disabled | | |

### 영역 5: 맞춤 코칭 생성 E2E

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 5-1 | 체크박스 선택 → 새 코칭 받기 | 생성 성공, user_context 반영 | | |
| 5-2 | 자유입력 → 새 코칭 (Pro) | user_context POST 전송 | | |
| 5-3 | 생성 성공 후 입력 초기화 | 체크박스 해제, 텍스트 초기화 | | |
| 5-4 | usage 즉시 갱신 | used N→N+1 반영 | | |
| 5-5 | FastAPI 로그 user_context 확인 | 로그에 필드 노출 | | |
| 5-6 | 생성 중 버튼 비활성 | dimmed, 중복 탭 무효 | | |

### 영역 6: 429 에러 파싱

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 6-1 | 한도 초과 후 생성 시도 | `일일 코칭 한도에 도달했어요` | | |
| 6-2 | 버스트 (10분 내 2회 초과) | `잠시 후 다시 시도해 주세요` | | |
| 6-3 | 서버 오프 | `코칭 생성에 실패했어요` | | |

### 영역 7: 캐시 무효화

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 7-1 | 새 코칭 생성 직후 usage 갱신 | 즉시 반영 | | |
| 7-2 | 기록→최신 탭 복귀 | 최신 코칭 표시 | | |
| 7-3 | 피드백 제출 후 재진입 | 별점 상태 유지 | | |

### 영역 8: 회귀

| # | 시나리오 | 기대값 | 결과 | 비고 |
|---|---------|--------|------|------|
| 8-1 | 히스토리 코칭 선택 | 해당 코칭 내용 표시 | | |
| 8-2 | 히스토리 뒤로가기 | 기록 탭 목록 복귀 | | |
| 8-3 | 액션 아이템 체크 | 낙관적 업데이트 즉시 반영 | | |
| 8-4 | 공유 버튼 탭 | Share 다이얼로그 노출 | | |
| 8-5 | 훈련 시작하기 | `/training/academy` 이동 | | |
| 8-6 | 코칭 없을 때 생성 버튼 | 생성 플로우 정상 진입 | | |

---

## 자동화 테스트 결과

### BE pytest (84개)

```
tests/test_coaching_prompts.py::test_build_user_prompt_includes_ai_persona_preferences  PASS
tests/test_coaching_prompts.py::test_build_user_prompt_injects_user_context              PASS
tests/test_coaching_prompts.py::test_build_user_prompt_no_user_context_section_when_none PASS
tests/test_coaching_prompts.py::test_build_user_prompt_empty_string_user_context_not_injected PASS
tests/test_coaching_prompts.py::test_build_user_prompt_multiple_situations_combined      PASS
tests/test_schemas.py::TestCoachingSchemas::test_coaching_request_defaults               PASS
tests/test_schemas.py::TestCoachingSchemas::test_coaching_request_user_context_accepted  PASS
tests/test_schemas.py::TestCoachingSchemas::test_coaching_request_user_context_max_length PASS
tests/test_schemas.py::TestCoachingSchemas::test_coaching_request_user_context_boundary  PASS
tests/test_schemas.py::TestCoachingSchemas::test_daily_usage_response_default_limit_is_one PASS
tests/test_schemas.py::TestCoachingSchemas::test_daily_usage_response_explicit_values    PASS
84 / 84 PASS
```

### FE Jest (166개)

```
src/lib/api/__tests__/coaching.test.ts
  generateCoaching
    ✅ 백엔드에 POST 요청을 보내고 코칭 결과를 반환한다
    ✅ report_type 미지정 시 DAILY가 기본값이다
    ✅ userContext 전달 시 body에 user_context 포함된다       ← 신규
    ✅ userContext 빈 문자열 시 body에 user_context 미포함     ← 신규
    ✅ 백엔드 에러 시 예외를 전파한다
  parseCoachingError
    ✅ 429 에러를 파싱하여 remaining과 retryAfterSec를 반환한다
    ✅ 503 에러를 AI 서비스 문제 메시지로 변환한다
    ✅ 기타 에러를 일반 실패 메시지로 변환한다
    ✅ status 없는 에러는 500으로 처리한다
    ✅ 429에서 remaining 없고 daily_limit 있으면 daily_limit으로 폴백 ← 신규
    ✅ 429에서 remaining도 daily_limit도 없으면 0 반환               ← 신규
166 / 166 PASS
```

### TypeScript 컴파일

```
npx tsc --noEmit → No errors found
```

---

## 수동 테스트 체크리스트 (실기기 필요)

### 영역 1: 한도 표시
| # | 시나리오 | 결과 |
|---|---------|------|
| 1-1 | 무료 `오늘 0/1회 사용` | 🔲 미완료 |
| 1-2 | 무료 코칭 후 `오늘 1/1회 사용` | 🔲 미완료 |
| 1-3 | Pro `오늘 N/10회 사용` | 🔲 미완료 |

### 영역 2: Pro CTA
| # | 시나리오 | 결과 |
|---|---------|------|
| 2-1 | 무료 미초과 → `새 코칭 받기` | 🔲 미완료 |
| 2-2 | 무료 초과 → `✨ PRO로 무제한 코칭 받기` | 🔲 미완료 |
| 2-3 | Pro CTA 탭 → 구독 화면 이동 | 🔲 미완료 |
| 2-4 | Pro 초과 → `내일 다시 가능해요 🌙` | 🔲 미완료 |

### 영역 3–4: 개인화 배지 + 상황 입력
| # | 시나리오 | 결과 |
|---|---------|------|
| 3-1 | 최신 탭, 미선택 → 기본 배지 | 🔲 미완료 |
| 3-2 | 체크박스 선택 → 배지 변경 | 🔲 미완료 |
| 3-3 | 기록 탭 → 입력 UI 미노출 | 🔲 미완료 |
| 4-4 | 체크박스 토글 색상 전환 | 🔲 미완료 |
| 4-5 | 무료 자유입력 힌트 배너 | 🔲 미완료 |
| 4-6 | Pro 자유입력 TextInput 활성 | 🔲 미완료 |

### 영역 5: E2E 생성
| # | 시나리오 | 결과 |
|---|---------|------|
| 5-1 | 체크박스 → 새 코칭 생성 성공 | 🔲 미완료 |
| 5-3 | 생성 후 입력 초기화 | 🔲 미완료 |
| 5-4 | usage 즉시 N+1 반영 | 🔲 미완료 |

### 영역 8: 회귀
| # | 시나리오 | 결과 |
|---|---------|------|
| 8-1 | 히스토리 코칭 선택 정상 | 🔲 미완료 |
| 8-3 | 액션 아이템 낙관적 업데이트 | 🔲 미완료 |
| 8-5 | 훈련 시작하기 → academy | 🔲 미완료 |

---

## 종합 판정

| 구분 | 통과 | 실패 | 미완료 |
|------|------|------|--------|
| BE 자동화 (pytest) | 84 | 0 | 0 |
| FE 자동화 (Jest) | 166 | 0 | 0 |
| FE 타입 검사 (tsc) | ✅ | — | — |
| 수동 실기기 | — | — | 22개 |

## 리스크

- AIT deploymentId `019e4368-4723-7038-ab1b-0c5e3ab5a44b` 실기기 진입 미확인
- iOS TextInput multiline 상단 정렬 실기기 확인 필요 (`paddingTop: 0` 수정 반영됨)
