# Common Code Antipatterns

Reference document for code-smell skill.

## Silent Catch

Catching an exception and doing nothing with it. Hides errors, makes debugging impossible.

**Signal:** `catch {}`, `catch (e) {}`, `catch (_) { /* ignore */ }`

## God Object

A class or module that knows too much or does too much. Creates tight coupling.

**Signal:** Class with 20+ methods spanning unrelated concerns, single file importing from every other module.

## Magic Numbers

Numeric literals with no explanation embedded in logic.

**Signal:** `if (status === 403)`, `setTimeout(fn, 86400000)` without a named constant.

## N+1 Query

Executing a database query inside a loop, resulting in N+1 total queries.

**Signal:** `await db.find()` inside a `for` loop or `.map()`, loading related records one at a time.

## Callback Hell

Deeply nested callbacks making control flow impossible to follow.

**Signal:** More than 3 levels of nested callbacks or `.then()` chains.

## Mutating Function Arguments

Modifying objects passed as parameters, causing unexpected side effects in callers.

**Signal:** `arg.property = value` or `arg.push(item)` inside a function where `arg` came from a parameter.

## Boolean Trap

Using boolean parameters to control function behaviour, making call sites unreadable.

**Signal:** `doThing(true, false, true)` — caller cannot understand what the booleans mean.

## Premature Optimisation

Adding complexity for performance before profiling shows it is needed.

**Signal:** Custom cache implementations, manual memory management, micro-optimised loops in code that runs infrequently.
