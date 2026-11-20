---
name: tdd
description: The red-green loop and the machinery it runs on in this repo - seams, vertical slices, which file and runner a test belongs in, the Radix ports, the story server, the coverage floor, and the anti-patterns that produce tests nobody can refactor past. Use when writing, fixing or reviewing any test here, building a feature test-first, or when a test passes without being able to fail.
---

# Test-Driven Development

TDD is the red -> green loop. This skill is the reference that makes that loop produce
tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules
of the loop. Every section applies on every cycle: consult them before and during the loop,
not after.

## In this repo

Five facts change how the loop behaves here:

- **Red has to be an assertion failure.** vitest does not type-check, so a test
  that "fails" because the types are wrong is not red, it is unwired. `bun run check-types` is
  the only thing that reads a type.
- **One runner.** Every package runs vitest, each from its own `vitest.config.ts`. A package
  that renders runs in vitest's jsdom environment, which gives each file a document of its own.
  The packages moved from `bun test` import `describe`, `it`, `expect` and `vi` from `vitest`;
  `calendar`, `cli`, `hooks`, `lazy`, `libs`, `variants` and `vim` turn the globals on.
- **One cycle, one tier.** The unit suite is where the loop lives. The browser tier,
  `bun run test:e2e` in `packages/duck-primitives`, builds the stories and starts browsers;
  pull it into the loop and the cycle stops being tight.
- **A failing test may be pinning a bug on purpose.** Before turning one green, find out
  whether it is red because your code is wrong or because the code it covers is knowingly
  broken. Rewriting the second kind deletes the only record of the bug.
- **Names come from Radix and the module's own `README.md`.** A primitive's parts, states and
  data attributes are named there. Name cases in those words so a test reads as a claim about
  the component.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change
entirely; tests shouldn't. A good test reads like a specification: "closes on Escape and hands
focus back to the trigger" tells you exactly what capability exists, and it survives refactors
because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior
without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test
and confirm them with the user. No test is written at an unconfirmed seam. You can't test
everything, so agreeing the seams up front is how testing effort lands on the critical paths
and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

For a primitive the seams are already named. Its tests sit in `src/<module>/__tests__/`, and
each file proves what the one before it cannot:

| File | Runs under | Proves |
|---|---|---|
| `<module>.test.tsx` | vitest, jsdom | the parts through their props and the DOM they render, driven with `@testing-library/react` and `user-event` |
| `<name>.radix.test.tsx` | vitest, `src/__tests__/radix/harness.tsx` | Radix's own cases for the same primitive pass here too. Each file calls `radixEnvironment()`. |
| `<module>.e2e.ts` | Playwright, the module's `__stories__` | what jsdom cannot: layout, real focus order, pointer events, animation |

Suites that cross modules, keyboard, axe and integration, live in `src/__tests__/` itself. A
helper reused across modules goes in `src/libs/` with its own tests there, and is tested again
only through the primitives that use it.

Three things bite at these seams:

- **A browser spec is named `*.e2e.ts`**, never `*.e2e.test.ts`, which vitest would collect
  and fail without a browser.
- **A file that never unmounts** leaves its roots for the next test in it, since testing-library
  cleans up on its own only under vitest's globals. A file starts from `freshDom()` in
  `src/__tests__/dom.ts`.
- **The story server is on port 9009**: `bun run stories` in `packages/duck-primitives` serves an index of every
  story at `/`. Playwright reuses one already running outside CI.
  Check `lsof -iTCP:9009` first, or the run tests another checkout's stories.

When the shape of that interface is itself in question (how deep the module is, where the
seam belongs, what the interface should expose), call the Skill tool with "codebase-design"
for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter,
leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or
  verifies through a side channel (reading a ref or a context instead of what the part
  renders). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does
  (`expect(clamp(v, a, b)).toBe(Math.min(Math.max(v, a), b))`, a snapshot derived by hand the
  same way, a constant asserted equal to itself), so it passes by construction and can never
  disagree with the code. Expected values must come from an independent source of truth: a
  known-good literal, a worked example, Radix's behaviour, the WAI-ARIA pattern.
- **Passing without asserting**: an `expect` that never runs, a `waitFor` whose callback
  returns rather than throws, an awaited promise whose rejection nobody reads. Prove a new test
  can fail by mutating the code it covers and watching it go red. Every module README claims
  this was done for each of its tests.
- **Thrown for any reason**: a bare `toThrow()` passes when the code throws for the wrong
  reason. Assert the message, as the `createContext` tests assert the part and root it names.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify
  _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the
  tests go insensitive to real changes, and you commit to test structure before understanding
  the implementation. Work in **vertical slices** instead: one test -> one implementation ->
  repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't
  anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the
  `code-review` skill), not the red -> green implementation cycle.

## Coverage

`@gentleduck/primitives` holds 100% coverage, enforced by the thresholds in its
`vitest.config.ts` whenever `bun run test` runs, and a source file no test loads counts as never
run. The thresholds are a ratchet: a drop is the thing to fix rather than the number to lower.

- **An uncovered line is a design signal first.** Before writing a test to reach it, ask
  whether the line should exist. An unreachable `catch` or a defensive branch the types forbid
  is deleted, not tested.
- **Raise the bar, never lower it.** No ignore pragma, no excluding a file to go green, no
  asserting on a mock where the real thing was available.

## Before calling the cycle done

- The test failed for the right reason before it passed.
- It asserts behaviour a reader can name, at a seam that was agreed.
- `bun run test` is green for the whole package, not just the one file you ran.
- `bun run check-types` is green, since neither runner read the types.
- The module README's `<!-- tests -->` and `<!-- behaviour -->` blocks list the test, and its
  "Beyond Radix" or "Fixed" section names a behaviour that now differs from Radix.
