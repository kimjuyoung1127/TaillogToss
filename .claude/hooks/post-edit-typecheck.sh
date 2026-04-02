#!/bin/bash
# PostToolUse hook: src/ 내 .tsx, .ts 파일 편집 후 TypeScript 컴파일 체크 자동 실행
# React Native (granite-js) 프로젝트이므로 tsc --noEmit으로 타입 안전성 확인

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# src/ 내 TypeScript/TSX 파일만 필터
if [[ "$FILE_PATH" =~ ^.*/src/.*(\.tsx?|\.ts)$ ]]; then
  cd /Users/family/jason/TaillogToss
  npx tsc --noEmit --pretty 2>&1 | tail -10 >&2
fi

exit 0
