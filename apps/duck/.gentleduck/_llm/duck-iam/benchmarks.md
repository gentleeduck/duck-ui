Two different things get measured here and they are constantly confused: the raw rule matcher, and `engine.can()`, the entry point a real request goes through. The matcher is roughly 7 percent of a warm check. Every table below states which of the two it measures.

## Provenance

Package version: **5.9.0**. Hardware: **AMD Ryzen 9 9955HX**. Runner: **vitest 4.1.9**. The head-to-head table reproduces the Performance section of the package `README.md`; the layer-attribution and scaling tables reproduce `ARCHITECTURE-PERF.md`, which states the same hardware and runner. If the version you installed is not 5.9.0, treat every number here as unverified and re-run the suite.

## Methodology

The head-to-head suite is `test/benchmark.bench.ts`, run with `bun run bench` (vitest bench). It benchmarks `@gentleduck/iam` against five libraries installed as devDependencies of the package: `@casl/ability` `^7.0.0`, `casbin` `^5.50.0`, `accesscontrol` `^3.1.0`, `@rbac/rbac` `^2.1.3`, and `easy-rbac` `^4.0.0`. Every library solves the same authorization problem over the same fixtures. CASL condition checks call `subject()` so that conditions actually run — bare string checks skip condition evaluation and would flatter CASL further. Libraries without attribute conditions are excluded from the ABAC scenarios rather than scored as zero. Sub-microsecond scenarios use an N=3 inner loop to keep vitest's own overhead out of the measurement.

Two more suites ship in-tree and are run by the same command:

* `src/core/evaluate/__tests__/evaluate.bench.ts` — micro-benchmarks for `evaluatePolicyFast`, `indexPolicy` cold and warm, and the cross-policy combine modes.
* `src/core/resolve/__tests__/resolve.bench.ts` — dot-path resolution and the pattern matchers.

The layer-attribution and scaling tables come from scratch benchmarks written for the architecture review (`ARCHITECTURE-PERF.md`), run on the same machine with the same runner. Each line there was measured separately, so treat it as attribution rather than a profiler trace; it accounts for the total closely but not exactly.

Absolute nanosecond figures are machine specific and the ratios are what carry over. One calibration number matters when reading them: on this hardware an empty benchmark body measures about 34 million ops/sec, so anything at or above roughly 33M is measuring the harness, not the code.

The head-to-head suite and the architecture benchmarks use different policy fixtures, so their absolute numbers are not comparable line to line. Compare within a table, never across tables.

## Rule matching only

No adapter, no engine wrapper, no subject resolution: this is `iamEvaluateFast()` against an in-memory policy, next to each competitor's equivalent hot path. From `bun run bench`.

| Library | ops/sec | vs CASL |
| --- | --- | --- |
| `@casl/ability` | ~17.0M | baseline |
| `@gentleduck/iam` `iamEvaluateFast()` | ~7.6M | 2.2x slower |
| `easy-rbac` | ~5.0M | 3.4x slower |
| `@rbac/rbac` | ~3.3M | 5.2x slower |
| `accesscontrol` | ~1.3M | 12.8x slower |
| `casbin` | ~208K | 82x slower |

This is the number most authorization libraries advertise. It is also the number that matters least, because almost nobody calls the matcher directly.

## engine.can(), the real entry point

Full stack: adapter, caches, subject resolution, scoped-role enrichment, hooks, and the compiled table. From `bun run bench`.

| Mode | ops/sec | vs CASL |
| --- | --- | --- |
| `mode: 'production'` (compiled table) | ~1.15M | ~14x slower |
| `@casl/ability`, ability pre-built | ~17.0M | baseline |

Development mode is not a separate evaluator. It takes the same verdict from the same compiled table and *also* runs the interpreter, to recover the `reason` / `policy` / `rule` provenance the table erases at compile time and to assert the two agree. That costs roughly 2.4x production on this hardware.

CASL is a narrower tool: one flat rule set, fully synchronous, no persistence layer, rules frozen at `build()`. `engine.can()` additionally runs a policy engine with four combining algorithms across N named policies, RBAC inheritance, an adapter and cache and invalidation layer, and lifecycle hooks — and it is `async`. The gap is the cost of that surface.

In practice it is not the bottleneck. 1.15M ops/sec is about 0.87 microseconds per check on one core. A single database round trip in the same request costs three orders of magnitude more.

An engine that sets no `mode` runs the compiled table alone and returns bare booleans. Passing `mode: 'development'` buys `IDecision` objects and `explain()` at the second evaluator's cost: 1,083,000 against 435,000 ops/sec on the architecture fixture, a 2.5x penalty. See [modes](/duck-iam/advanced/engine/modes).

## Where a warm check spends its time

One fully cached `engine.can()` in production mode costs about **950 nanoseconds** on this hardware. The evaluator is 7 percent of that.

| Step | Cost | Share |
| --- | --- | --- |
| Subject cache read, LRU churn on a 500-entry map | ~478 ns | 50% |
| Promise chain, four nested async functions | ~277 ns | 29% |
| Merged policy cache read, one-entry map | ~90 ns | 9% |
| `evaluateFast` on a small policy set | ~66 ns | 7% |
| `ensureEnvNow` spread plus `Date.now()` | ~34 ns | 4% |
| Request object, signals object, guards | ~40 ns | 4% |

Confirmed end to end on the architecture fixture:

| Path | ops/sec | vs raw |
| --- | --- | --- |
| `evaluateFast`, raw and synchronous | 14,937,000 | baseline |
| `engine.can()` production, all caches warm | 1,083,000 | 13.8x slower |
| `engine.can()` development, all caches warm | 435,000 | 34.3x slower |

A hand-written synchronous version of the same warm check, same policy, same answer, runs at 9,589,000 ops/sec against `engine.can()`'s 1,012,000 in the same file — 9.5x. That difference is not authorization work. It is routing an already-computed answer through four `async` functions and an LRU cache that rewrites its own backing `Map` on every read.

### The three costs behind that

| Measured | ops/sec | per read |
| --- | --- | --- |
| `IamLRUCache.get()` on a 500-entry map | 2,092,000 | 478 ns |
| Same, stamping a counter instead of mutating the map | 31,762,000 | 31 ns |
| Bare `Map.get`, the floor | 33,534,000 | 30 ns |
| `IamLRUCache.get()` on a one-entry cache | 11,050,000 | 90 ns |
| Plain slot read with a caller-supplied clock | 33,392,000 | 30 ns |

And the promise chain, measured with nothing in the functions but the awaits: one await 11,580,000 ops/sec, three awaits 6,542,000, five awaits 3,607,000, against 33,791,000 for a synchronous call.

None of these are fixed in 5.9.0. They are recorded here so the published numbers can be read honestly, and are tracked in the package's `ARCHITECTURE-PERF.md`.

## Scaling

Throughput per check does not degrade with catalog size in production mode — the compiled table is an O(1) index lookup regardless of how many roles or policies exist. What constrains scale is catalog *shape*.

### Policy count

`evaluateFast` iterates every policy in the merged array, not just the ones that could match. A policy targeted at another action still costs a function call and a WeakMap lookup on every request.

| Policies, one of which matches | ops/sec | per check |
| --- | --- | --- |
| 1 | 15,153,000 | 66 ns |
| 10 | 3,891,000 | 257 ns |
| 50 | 765,000 | 1,307 ns |

The measured win depends on ordering: with the matching policy first and `allow-overrides`, the current code short-circuits and the cost never appears. The table above puts the matching policy last, which is the honest floor.

### Role inheritance depth

`collectPermissions` copies every ancestor's permissions into each descendant's rule set, so the generated rule count grows as roughly `p * n * (n + 1) / 2` — quadratic in chain depth.

| Hierarchy | Distinct permissions | Generated rules | Blowup |
| --- | --- | --- | --- |
| 5 roles, 4 permissions each | 20 | 60 | 3x |
| 10 roles, 5 permissions each | 50 | 275 | 5.5x |
| 20 roles, 5 permissions each | 100 | 1,050 | 10.5x |

Every generated RBAC rule also carries a `subject.roles contains ROLE` guard, and the precompute step in `indexPolicy` skips any rule that has conditions. So the RBAC policy — usually the largest one, evaluated on every request — cannot use the fast path it would benefit from most: 15,631,000 ops/sec for an unconditional precomputed hit against 3,764,000 for the same rule with one `contains` condition, a 4.15x difference.

Rebuilding the generated policy costs too: `rolesToPolicy` on that 20-role hierarchy runs at 7,858 per second, about 127 microseconds, paid on every role-cache refresh.

### Wildcards

One wildcard rule anywhere in a policy disables the precomputed table for that entire policy, because a wildcard could override a cached answer. The conservatism is correct; the cost is real.

| Policy | ops/sec |
| --- | --- |
| 51 literal rules, no wildcard | 15,593,000 |
| The same policy plus one unrelated `deny admin:* on secret` rule | 5,233,000 |

2.98x, for adding a rule that cannot possibly match the request being checked. Prefer literal action and resource pairs where you can; see [rule matching](/duck-iam/core/rule-matching).

### Batching

`permissions()` resolves the subject once and loads the catalog once for the whole batch, which is why it beats a loop of `can()`.

| Path | per check |
| --- | --- |
| 20 separate `engine.can()` calls | 858 ns |
| `permissions()` with 20 checks | 473 ns |
| `permissions()` with 20 checks, `telemetry: false` | 457 ns |

`telemetry: false` is worth about 3 percent, not the 2x that older docs claimed. Use it for hot UI gates if you want, but do not expect it to change a profile.

### Things that are already fine

Measured and deliberately left alone, so nobody spends a weekend on them:

* Building the `action\0resource` index key: 33,694,000 ops/sec, indistinguishable from the harness floor. A nested `Map` is marginally *slower*.
* `Reflect.get` in `resolve()`: 26,284,000 ops/sec against 25,930,000 for plain bracket access. Statistically identical, and `Reflect.get` is there for prototype safety.
* The per-call dependency bag: 34,003,000 ops/sec built fresh versus 33,723,000 reused. V8's escape analysis removes it entirely.
* Rule count *inside* a policy: 5 rules 6,821,000 ops/sec, 50 rules 6,977,000, 500 rules 6,970,000. Flat. The scaling problem is across policies, not within one.

## Bundle size

| Module | Size, gzipped |
| --- | --- |
| Core engine, typical import | ~15 KB |
| `core/validate`, admin only, lazily loaded | 12 KB |
| `core/builder`, config-time only | 9 KB |
| `core/explain`, development-mode trace | separate chunk |
| Each adapter | 1.7 – 6 KB |
| Each server integration | 2.4 – 3.7 KB |
| Each client | 1.2 – 2.0 KB |
| `import * from '@gentleduck/iam'` | ~41 KB |

The 41 KB headline is the worst case: the everything-barrel, pulling every adapter, every server integration, every client, the builder, the explain tracer, and the validator. Nothing imports it that way in real code. Deployments using subpath imports and standard tree-shaking land at 15 to 25 KB.

### Per-profile numbers

The per-route profiles below were measured by resolving `dist/` chunks through the import graph and gzipping them, at package version 2.2.0. They are consistent with the module ranges above, but the exact kilobyte figures have not been regenerated. Treat them as shape, not as precision.

| Profile | Imports | Effective bundle |
| --- | --- | --- |
| Edge function, RBAC only | `core` + `adapters/memory` | ~17 KB |
| Express plus Redis backend | `server/express` + `adapters/redis` | ~22 KB |
| Hono plus memory | `server/hono` + `adapters/memory` | ~19 KB |
| Next.js plus Drizzle | `server/next` + `adapters/drizzle` | ~21 KB |
| NestJS plus Prisma | `server/nest` + `adapters/prisma` | ~20 KB |
| Admin dashboard | adds `core/builder` + `core/validate` | +21 KB on the admin route only |
| React UI gate, browser | `client/react` | ~1.3 KB |
| Vue UI gate, browser | `client/vue` | ~1.2 KB |
| Vanilla browser gate | `client/vanilla` | ~2.0 KB |

Why the browser numbers are so small: the clients wire a permission map the server produced into local state. The engine, the adapters, and the policy catalog never enter the browser bundle.

Competitor sizes for context, taken from bundlephobia and verified 2026-03-30 — minified and gzipped, and stale by construction since they track other projects' releases: `easy-rbac` ~2 KB, `@rbac/rbac` ~4 KB, `@casl/ability` ~6 KB, `accesscontrol` ~8.2 KB, `casbin` ~30 KB.

### Keeping your bundle tight

```ts
// Tight: only what you use.
import { IamEngine } from '@gentleduck/iam/core'
import { IamMemoryAdapter } from '@gentleduck/iam/adapters/memory'
import { iamAdminRouter } from '@gentleduck/iam/server/express'

// Wide: the everything-barrel, ~41 KB.
import { IamEngine } from '@gentleduck/iam'
```

The `mode` flag changes runtime behaviour, not bundle size — it is a runtime check, not a build-time one. Import paths are what move the number. The validator is lazily loaded on the first `engine.admin` write, so read-only services never pay for it; the builder ships only if you import `core/builder`; the explain tracer is a separate chunk that production builds drop.

### The smallest possible surface

If you only need policy evaluation — no adapter, no engine, no config layer — build a policy object by hand and call the evaluator directly. This is the floor:

```ts
import { iamEvaluatePolicyFast } from '@gentleduck/iam/core'
import type { AccessControl, IamRequest } from '@gentleduck/iam/core'

type Action = 'read' | 'update' | 'delete'
type Resource = 'post' | 'comment'

const policy: AccessControl.IPolicy<Action, Resource> = {
  id: 'blog-policy',
  name: 'Blog policy',
  algorithm: 'deny-overrides',
  rules: [
    {
      id: 'allow-read',
      effect: 'allow',
      actions: ['read'],
      resources: ['post', 'comment'],
      conditions: { all: [] },
      priority: 0,
    },
  ],
}

const request: IamRequest.IAccessRequest<Action, Resource> = {
  subject: { id: 'user-1', roles: ['viewer'], attributes: {} },
  action: 'read',
  resource: { type: 'post', id: 'post-1', attributes: {} },
}

const allowed = iamEvaluatePolicyFast(policy, request) // boolean | null
```

`iamEvaluatePolicyFast` returns `null` for NotApplicable — the policy's targets did not match — which is why it is `boolean | null` and not `boolean`. The `iam`-prefixed name is the public one: the raw `evaluatePolicyFast` is deliberately not re-exported, because it carries no `allowFailOpen` gate. `IPolicy.name`, `IRule.priority`, `IRule.conditions`, `ISubject.attributes`, and `IResource.attributes` are all required, and `conditions` must name one of `all` / `any` / `none` — a bare `{}` is a type error. Everything you do not import drops out: `IamEngine`, `explain`, the builder, the config layer, the validator, and every adapter.

## Why CASL is faster, and when that matters

CASL iterates every rule once at `build()` and produces an index keyed by action and subject type. Each `can()` is one hash lookup, and the rules cannot change afterwards. duck-iam loads its catalog from an adapter, caches it with a TTL, invalidates it across instances, and re-evaluates against a policy engine — so it carries a cache-validity check and a `Map` lookup that CASL has already spent at build time.

Closing that gap means giving up dynamic policies and compiling at init like CASL does, which would break adapters, runtime policy updates, and cache invalidation — the features that make this a policy engine rather than a lookup table. It is a deliberate trade, not an optimization backlog item.

Where it lands in a real request:

| Step | Time |
| --- | --- |
| Network round trip | 5,000 – 50,000 us |
| Database query | 500 – 5,000 us |
| JSON serialization | 50 – 500 us |
| `engine.can()`, production mode | ~0.87 us |

At 100 checks per request the engine contributes under 90 microseconds to a request that already costs tens of milliseconds.

## Correctness under speed

Speed is only interesting if the fast path agrees with the slow one. `src/core/evaluate/__tests__/oracle.test.ts` runs 1000 deterministic-random iterations per `(combine, defaultEffect)` pair. Each iteration generates a policy set mixing exact, wildcard, colon-prefix, dot-hierarchy, and parent-prefix resource patterns, plus randomized conditions, scoped roles, and target dimensions, then asserts:

```ts
evaluate(policies, request).allowed === evaluateFast(policies, request)
```

Across the audit rounds that preceded 5.9.0 the two paths drifted six times — first-match priority order, colon-prefix indexing, parent-prefix lookup, NotApplicable handling, and others. Each was caught by a regression test written after the bug shipped. The oracle is the generative guarantee that they cannot silently disagree on inputs nobody thought to write a test for. Failures print the seed, the policy set, and the request that diverged.

The wider suite stands at 268 test files and 5,474 tests in `src`, counted by `docs/TEST-INVENTORY.md`, which the suite itself fails on if it goes stale. Mutation testing through Stryker and an adapter compliance suite shared by every adapter run alongside it.

## Reproduce

```bash
cd packages/duck-iam
bun run bench      # vitest bench: head-to-head plus the two micro-benchmark suites
```

`scripts/benchmark.ts` still imports `MemoryAdapter`, the flat `Policy` and `AccessRequest` types, and `evaluate` / `evaluatePolicy` off `core/evaluate` — none of which exist under those names any more. The script fails at import until it is updated. Use `bun run bench`.

The architecture and scaling benchmarks live in `packages/duck-iam/tmp/`, which is gitignored, so they are not in a fresh checkout. Their construction is documented in `ARCHITECTURE-PERF.md` alongside every number reproduced on this page.

## Gotchas

* If you are reading this against a version other than 5.9.0, the ratios probably still hold and the absolute numbers probably do not.
* Comparing a number from the head-to-head table against one from the architecture tables is a mistake; the fixtures differ.
* Benchmarking `iamEvaluateFast()` and reporting it as your authorization cost overstates throughput by roughly 7x against `engine.can()` on the same fixture. Benchmark `engine.can()`.
* Competitor numbers move when competitors release. Re-run `bun run bench` rather than citing this page's table in an argument.

## See also

* [How it compares](/duck-iam/comparison) — the feature axes behind these numbers, and what was never measured.
* [Development vs production mode](/duck-iam/advanced/engine/modes) — what the second evaluator actually buys.
* [Caching](/duck-iam/advanced/engine/caching) — the caches that account for 59 percent of a warm check.
* [Production hardening](/duck-iam/guides/production) — TTLs, invalidation, and preloading in a real deployment.