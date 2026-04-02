PostToolUse hooks for automated validation.

- `post-edit-typecheck.sh`: Edit|Write on src/**/*.ts(x) triggers `tsc --noEmit`
- Registered in `.claude/settings.json` under `hooks.PostToolUse`
