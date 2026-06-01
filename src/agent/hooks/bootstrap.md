# Bootstrap Hook

On session start, before accepting any input:

1. Confirm `RULES.md` is present and readable. If missing, halt with an error.
2. Confirm `memory/feedback.md` is present. If missing, halt with an error.
3. Load all files in `knowledge/` into context.
4. Do not greet the user or output any text.
5. Await the first prompt silently.
