---
name: code-smell
description: Scan a unified diff for must-always-flag code patterns defined in RULES.md and return findings as a JSON array.
---

# Code Smell Scanner

## Input

- `diff` — raw unified diff string
- `rules` — content of RULES.md

## Output

JSON array of findings. Return `[]` if none. No other text.

## Instructions

1. Parse the diff to extract added lines only — lines starting with `+` but not `+++`.
2. Compute real file line numbers from hunk headers (`@@ -a,b +c,d @@`). The first added line in a hunk starts at line `c`.
3. For each added line, check against every pattern in the must-always-flag list.
4. One finding per occurrence. Do not deduplicate across lines.
5. Never flag anything in the must-never-flag list.
6. Return findings as a JSON array:

```json
[
  {
    "file": "src/api/users.ts",
    "line": 34,
    "message": "SQL query built by string concatenation — use parameterised queries.",
    "severity": "error",
    "ruleId": "sql-injection"
  }
]
```

## Rule IDs

| Pattern | ruleId |
|---|---|
| SQL concatenation | `sql-injection` |
| eval / Function() | `eval-injection` |
| Hardcoded secret | `hardcoded-secret` |
| console.log in prod | `console-log` |
| Silent catch | `silent-catch` |
| TypeScript any bypass | `any-bypass` |
| Missing input validation | `missing-validation` |
| Sync file I/O in handler | `sync-io` |
| dangerouslySetInnerHTML | `xss-inner-html` |
