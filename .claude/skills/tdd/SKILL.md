---
name: tdd
description: The red-green loop and the machinery it runs on in this repo - seams, vertical slices, which layer a test belongs at, which harness wires it, the coverage ratchet, and the anti-patterns that produce tests nobody can refactor past. Use when writing, fixing or reviewing any test here, building a feature test-first, or when a test passes without being able to fail.
---

# Test-Driven Development

TDD is the red -> green loop. This skill is the reference that makes that loop produce
tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules
of the loop. Every section applies on every cycle: consult them before and during the loop,
not after.

## In this repo

Five facts change how the loop behaves here:

- **Red has to be an assertion failure.** Vitest never type-checks, so a test that "fails"
  because the types are wrong is not red, it is unwired. `bun run check-types` is the only
  thing that reads a type, and a `.types.ts` file under `__tests__/` is a type test run by
  that command, never by vitest.
- **The seam for a hermetic cycle is the mocked ORM**, `mockOrm()` in `apps/marketplace-api`.
  It is a public boundary, not an internal collaborator, so asserting on `db.$calls` is a
  seam test rather than the implementation-coupling the anti-patterns below warn about.
- **One cycle, one tier.** `bun run test` is hermetic and is where the loop lives.
  `test:integration` and `test:e2e` each need a live Postgres and run at
  `--concurrency=1`; pull one of those into the loop and the cycle stops being tight.
- **A failing test may be pinning a bug on purpose.** Before turning one green, find out
  whether it is red because your code is wrong or because the code it covers is knowingly
  broken. Rewriting the second kind deletes the only record of the bug.
- **Domain language comes from `docs/business-architecture/`** and the module's own
  `README.md`. Name cases in those words so a test reads as a claim about the business.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change
entirely; tests shouldn't. A good test reads like a specification: "user can checkout with
valid cart" tells you exactly what capability exists, and it survives refactors because it
doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior
without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test
and confirm them with the user. No test is written at an unconfirmed seam. You can't test
everything, so agreeing the seams up front is how testing effort lands on the critical paths
and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

In a module here the seams are already named, and each file wires **only as much as its
layer needs**. Tests get more unit-like closer to the data and more integration-like closer
to the route.

| File | Wires | Uses |
|---|---|---|
| `{module}.model.test.ts` | the model alone | `mockClient([{module}Model])`, reading `$calls` |
| `{module}.admin.service.test.ts` | the service as a bare provider over a mocked `Orm` | `mockOrm()` |
| `{module}.admin.controller.test.ts` | the controller over a mocked service | `vi.fn()`, `handlerMeta` |
| `{module}.module.test.ts` | the real `{Module}Module` plus a `@Global()` module providing `Orm` | `createTestingApp`, `mockOrm()` |
| `{module}.admin.service.integration.test.ts` | the service over real Postgres | `createTestDatabase()` |
| `{module}.admin.e2e.test.ts` | nothing, real HTTP against built output | `startBuiltServer()`, the generated SDK |

The mocks live in `src/common/test-helpers/orm.ts`; the three harnesses are
`@iryss/testing`. A model test that imports the whole module, or a module test that
hand-wires providers instead of importing the real module, is testing the wrong thing at
that layer.

When the shape of that interface is itself in question (how deep the module is, where the
seam belongs, what the interface should expose), call the Skill tool with "codebase-design"
for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter,
leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or
  verifies through a side channel (querying the database instead of using the interface).
  The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does
  (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant
  asserted equal to itself), so it passes by construction and can never disagree with the
  code. Expected values must come from an independent source of truth: a known-good literal,
  a worked example, the spec.
- **Passing without asserting**: an `expect` that never runs, a `resolves` with nothing
  behind it, an awaited promise whose rejection nobody reads. Prove a new test can fail by
  mutating the code it covers and watching it go red. Mutate the file the test actually
  loads: against built output that is `dist`, not `src`.
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

Thresholds are enforced per package, in that package's own `vitest.config.ts`, and are a
ratchet rather than an aspiration. `test:coverage` is what `pre-push` runs, because a
threshold is only read when coverage is collected.

- **An uncovered line is a design signal first.** Before writing a test to reach it, ask
  whether the line should exist. An unreachable `catch`, a defensive branch the types
  forbid, an error code nothing throws: delete it. `health.service.ts` reached 100% by
  removing a `try` around code that cannot throw, not by testing it.
- **Raise the bar, never lower it.** No ignore pragma, no excluding a file to go green, no
  asserting on a mock where the real thing was available. Read a drop as the thing to fix.
- **A genuinely unreachable line is documented at the config**, with which of the three
  causes it is: TypeScript's `__decorate` helper branching on the runtime, a
  module-load or OS path, or a `typia.createAssert` validator inlined into the file.

## Before calling the cycle done

- The test failed for the right reason before it passed.
- It asserts behaviour a reader can name, at a seam that was agreed.
- `bun run test` is green for the whole package, not just the one file you ran.
- `bun run check-types` is green, since vitest read none of the types.
