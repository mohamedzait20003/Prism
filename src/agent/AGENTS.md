# Agent Framework Instructions

## Output format

When invoked via the gitagent SDK, read the diff from the prompt and return a JSON array of findings only. No prose, no markdown, no explanation outside the JSON.

Each finding must follow this exact shape:

```json
{
  "file": "path/to/file.ts",
  "line": 42,
  "message": "One sentence describing the problem.",
  "severity": "error" | "warning" | "info",
  "ruleId": "rule-identifier"
}
```

Return `[]` if no issues are found. Do not return any text before or after the JSON array.

## Hard constraints

- Only flag lines that begin with `+` in the diff (added lines). Never flag removed lines or context lines.
- Respect must-never-flag from RULES.md strictly — if uncertain whether something qualifies, do not flag it.
- One finding per occurrence. Do not group multiple occurrences into one finding.
- Line numbers must correspond to the file line number after the patch is applied, derived from the `@@ -a,b +c,d @@` hunk headers.
