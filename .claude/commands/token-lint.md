스타일 토큰 준수 검사를 실행합니다.

## 수행 순서

### 1. 변경된 파일 파악
- `git diff --name-only HEAD` 또는 `git diff --name-only --cached`로 변경된 TSX/TS 파일 목록 추출
- 파일이 없으면 전체 `src/**/*.tsx` 대상

### 2. 토큰 린트 실행

변경된 파일의 스타일 관련 코드에서 다음 패턴을 검색:

| 규칙 | 위반 패턴 | 올바른 사용 |
|------|----------|-----------|
| **color-literal** | `'#FF0000'`, `rgba(` 하드코딩 | `tokens.colors.*` 사용 |
| **font-size** | `fontSize: 14`, `fontSize: '14px'` | `tokens.typography.*` 사용 |
| **spacing** | `padding: 8`, `margin: 16` 하드코딩 | `tokens.spacing.*` 사용 |
| **border-radius** | `borderRadius: 8` 하드코딩 | `tokens.radius.*` 사용 |

### 3. 검사 방법

```bash
# 각 규칙별 grep 패턴
grep -rn "color.*['\"]#[0-9a-fA-F]" <files>         # hex 컬러 하드코딩
grep -rn "rgba\?\s*(" <files>                         # rgba 하드코딩
grep -rn "fontSize.*[0-9]" <files>                    # fontSize 숫자 직접
grep -rn "padding.*[0-9]\|margin.*[0-9]" <files>      # spacing 숫자 직접
```

단, `styles/tokens.ts` 자체와 `*.test.*` 파일은 제외.

### 4. 결과 보고

위반 0건이면 PASS 표시.
1건 이상이면 구조화된 테이블 출력:

```
## Token Lint Report

| Location | Rule | Violation | Suggestion |
|----------|------|-----------|------------|
| src/pages/dog/profile.tsx:42 | color-literal | '#333333' | tokens.colors.gray900 |
| src/components/Card.tsx:18 | spacing | padding: 16 | tokens.spacing.md |
```

## 규칙
- `src/styles/tokens.ts` 파일 자체는 검사 대상 아님
- 테스트 파일(`*.test.*`, `*.spec.*`)은 제외
- TDS 컴포넌트 내부 prop으로 전달되는 값은 TDS 스펙 확인 후 판단
- tokens import가 있지만 일부 값만 하드코딩된 경우도 위반 처리
