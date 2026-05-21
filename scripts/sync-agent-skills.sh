#!/usr/bin/env bash
set -euo pipefail

ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
MODE="${1:---check}"

SOURCE="$ROOT/.claude/skills"
TARGET="$ROOT/.agents/skills"

usage() {
  cat <<'USAGE'
Usage: scripts/sync-agent-skills.sh [--check|--dry-run|--apply]

Keeps .agents/skills active entries as a mirror of .claude/skills.
.claude/skills is the source of truth.
Legacy archive folders such as _backup and _enrichment are intentionally excluded.
USAGE
}

case "$MODE" in
  --check|--dry-run|--apply) ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

if [[ ! -d "$SOURCE" ]]; then
  echo "MISSING: .claude/skills" >&2
  exit 1
fi

if [[ ! -d "$TARGET" ]]; then
  echo "MISSING: .agents/skills" >&2
  exit 1
fi

if [[ "$MODE" == "--check" ]]; then
  if diff -qr \
    --exclude _backup \
    --exclude _enrichment \
    "$SOURCE" "$TARGET" >/tmp/taillog-skill-diff.$$; then
    rm -f /tmp/taillog-skill-diff.$$
    echo "Skill mirrors in sync."
    exit 0
  fi

  echo "Skill mirror drift detected (.claude/skills -> .agents/skills):"
  sed -n '1,120p' /tmp/taillog-skill-diff.$$
  rm -f /tmp/taillog-skill-diff.$$
  exit 1
fi

if [[ "$MODE" == "--dry-run" ]]; then
  rsync -a --delete --dry-run --itemize-changes \
    --exclude _backup \
    --exclude _enrichment \
    "$SOURCE/" "$TARGET/"
  exit 0
fi

rsync -a --delete \
  --exclude _backup \
  --exclude _enrichment \
  "$SOURCE/" "$TARGET/"
diff -qr \
  --exclude _backup \
  --exclude _enrichment \
  "$SOURCE" "$TARGET" >/dev/null
echo "Skill mirrors synced: .claude/skills -> .agents/skills"
