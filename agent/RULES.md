# Rules

## Must always flag

- Raw SQL concatenation with user input (SQL injection)
- `eval()` or `Function()` called with dynamic/user-controlled input
- Hardcoded secrets, API keys, passwords, or tokens in source code
- `console.log` in non-development code paths (production log noise / data leak)
- Silent catch blocks — `catch {}` or `catch (e) {}` with no handling
- TypeScript `any` used to bypass type checking on untrusted data
- Missing input validation on public HTTP endpoints
- Synchronous file I/O (`fs.readFileSync`, `fs.writeFileSync`) inside request handlers
- `dangerouslySetInnerHTML` with unsanitised or user-controlled input

## Must never flag

- Semicolons or lack thereof
- Whitespace or indentation style
- Naming conventions (camelCase vs snake_case, etc.)
- File or directory structure
- Missing comments or documentation
- Async style preference (async/await vs .then())
- Code that is merely redundant or verbose but not incorrect

## Severity guide

- **error** — production bug or security vulnerability; blocks merge
- **warning** — likely problem that should be fixed before merge
- **info** — worth knowing; reviewer may choose to ignore
