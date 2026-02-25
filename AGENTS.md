<!-- TailLog Toss 에이전트 실행 규약 -->
<!-- 이 저장소는 React Native 이식 작업의 단일 쓰기 저장소다. -->
# TailLog Toss Agent Rules (MUST)

- MUST: 모든 작업 시작 전에 `CLAUDE.md`와 `docs/10-MIGRATION-OPERATING-MODEL.md`를 읽고 따른다.
- MUST: 코드/파일 수정 전에 변경 내용을 1~2문장으로 먼저 알린다.
- MUST: 작업 중간 진행상황을 짧게 주기적으로 공유한다.
- MUST: 작업 완료 시 변경 파일, 핵심 변경점, 검증 결과, 잔여 리스크를 보고한다.
- MUST: 모든 구현/수정 작업은 `docs/11-FEATURE-PARITY-MATRIX.md`의 `Parity ID`와 연결한다.
- MUST NOT: 사용자 요청 없이 파괴적 명령(`reset --hard`, 대량 삭제 등)을 실행하지 않는다.

## Repo Boundary

- Write Repo: `C:\Users\gmdqn\tosstaillog\TaillogToss`
- Read-Only Reference Repo: `C:\Users\gmdqn\DogCoach`
- 원본(`DogCoach`) 변경은 금지한다.

## React Native Guardrails

- `@apps-in-toss/react-native-framework` 기준으로 작업한다.
- TDS React Native 우선: Tailwind/Radix/Framer Motion/Next.js 신규 도입 금지.
- Toss S2S mTLS는 Supabase Edge Function 전담, FastAPI에 mTLS 구현 금지.

## Completion Format

- Scope: 이번 작업의 Parity ID 목록
- Files: 변경 파일 목록
- Validation: 실행/검증 결과
- Risks: 미해결 리스크와 다음 액션
