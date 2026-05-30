---
name: review-summary
description: Merge and deduplicate findings from code-smell and security-audit, rewrite messages to match SOUL.md tone, and return the final sorted array.
---

# Review Summary

## Input

- `code_smell_findings` — JSON array from the code-smell skill
- `security_findings` — JSON array from the security-audit skill
- `soul` — content of SOUL.md (tone reference)

## Output

Single merged JSON array. No other text.

## Instructions

1. Combine both input arrays into one list.
2. Deduplicate: if two findings share the same `file` and `line`, keep only the one with the higher severity (`error` > `warning` > `info`).
3. Rewrite each `message` to match SOUL.md tone:
   - One sentence only
   - Lead with the problem, not the file or line
   - No hedging language ("consider", "might", "perhaps")
   - No sarcasm
4. Sort the final array: errors first, then warnings, then info.
5. Return the merged array. Return `[]` if both inputs are empty.
