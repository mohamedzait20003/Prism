---
name: security-audit
description: Scan a unified diff for OWASP Top 10 security vulnerabilities and return findings as a JSON array.
---

# Security Audit

## Input

- `diff` — raw unified diff string
- `knowledge` — content of knowledge/owasp-top10.md

## Output

JSON array of findings. Return `[]` if none. No other text.

## Instructions

1. Parse the diff to extract added lines only — lines starting with `+` but not `+++`.
2. Compute real file line numbers from hunk headers (`@@ -a,b +c,d @@`).
3. Check each added line against the OWASP Top 10 signals in the knowledge document.
4. Security issues only — do not flag style, performance, or non-security patterns.
5. Prefer false negatives over false positives. Only flag when the signal is clear.
6. Use ruleId format `owasp-a01` through `owasp-a10` matching the category.

```json
[
  {
    "file": "src/auth/login.ts",
    "line": 18,
    "message": "Password stored without hashing — use bcrypt or argon2.",
    "severity": "error",
    "ruleId": "owasp-a02"
  }
]
```
