# OWASP Top 10 (2021)

Reference document for security-audit skill. Use these categories and signals when reviewing diffs for security vulnerabilities.

## A01 — Broken Access Control

Missing or bypassable authorization checks. Users can access resources or perform actions beyond their permissions.

**Code signals:** Missing auth middleware on routes, direct object references without ownership checks, CORS wildcard on sensitive endpoints, `req.user` not validated before use.

## A02 — Cryptographic Failures

Sensitive data exposed due to weak or missing encryption.

**Code signals:** Hardcoded secrets or keys, MD5/SHA1 for password hashing, HTTP URLs for sensitive data, storing passwords in plaintext, missing TLS enforcement.

## A03 — Injection

Untrusted data sent to an interpreter as part of a command or query.

**Code signals:** String concatenation in SQL queries, `eval()` with user input, `exec()`/`spawn()` with unescaped user data, template literals in database queries, `Function()` constructor with dynamic strings.

## A04 — Insecure Design

Missing security controls in the design itself, not just implementation flaws.

**Code signals:** No rate limiting on authentication endpoints, no account lockout, security decisions made in client-side code.

## A05 — Security Misconfiguration

Insecure default configurations, unnecessary features enabled, verbose error messages.

**Code signals:** `DEBUG=true` in production config, stack traces returned in API responses, default credentials, overly permissive file permissions, CORS `allowedOrigins: *` on auth endpoints.

## A06 — Vulnerable and Outdated Components

Using components with known vulnerabilities.

**Code signals:** Pinned dependency versions known to be vulnerable (flag only if the version is explicitly vulnerable, not just old).

## A07 — Identification and Authentication Failures

Weak authentication mechanisms.

**Code signals:** Passwords stored without bcrypt/argon2/scrypt, session tokens in URLs, missing `httpOnly`/`secure` on session cookies, JWT `alg: none`, hardcoded admin credentials.

## A08 — Software and Data Integrity Failures

Code and infrastructure without integrity verification. Insecure deserialization.

**Code signals:** `JSON.parse()` on untrusted input without validation, deserializing user-controlled data with class reconstruction, missing subresource integrity on CDN scripts.

## A09 — Security Logging and Monitoring Failures

Insufficient logging of security-relevant events.

**Code signals:** Silent catch blocks on authentication operations, no logging on failed login attempts, sensitive operations with no audit trail.

## A10 — Server-Side Request Forgery (SSRF)

Server making HTTP requests to attacker-controlled URLs.

**Code signals:** `fetch(req.body.url)`, `axios.get(userInput)`, `http.get(params.target)` without URL allowlist validation.
