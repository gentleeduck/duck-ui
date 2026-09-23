`mode` does not pick the evaluator. Both modes get their verdict from the [compiled table](/duck-iam/advanced/engine/compiled). What `mode` picks is how much provenance comes back with that verdict, and what it costs to produce it. `'production'` (the default) returns a bare `boolean`. `'development'` returns an `AccessControl.IDecision` and runs the interpreter a second time to fill it in.

## One verdict, two amounts of provenance

Production used to evaluate through the table and development through the interpreter, so any disagreement between the two was invisible until it reached production — and it reached production as an *allow* against a dev run that denied. The table is now authoritative in both modes. Development additionally runs the interpreter, because the table cannot explain itself: a `CONST_ALLOW` / `CONST_DENY` cell is a single `kind` byte and `allow` is a raw bitmask, so policy identity is erased at compile time. That erasure is the optimisation.

Three details of the development run are easy to get wrong. It is passed `onPolicyError: undefined`, because the authoritative run already reported — otherwise a handler wired to an alerting pipeline pages twice for one bad policy, in development only. It gets its own `signals` bag, so a `failOpen` seen only by the explanatory run cannot rewrite what the authoritative path reported; once the verdicts agree the signals take the union. And a disagreement **throws**: it means duck-iam has a bug, `authorize()` catches it and answers a generic fail-closed `'Evaluation error'` deny, and the real message also goes to `console.error` because that deny is the right verdict and a useless diagnostic.

Production does not run the interpreter and therefore cannot detect a disagreement. That asymmetry is deliberate: the second evaluator is the cost the fast path exists to avoid, and development is where the divergence is meant to be caught.

## What differs

| | `'development'` | `'production'` (default) |
| --- | --- | --- |
| Verdict from | compiled table | compiled table |
| Interpreter also runs | yes, for provenance | no |
| `authorize()` returns | `AccessControl.IDecision` | `boolean` |
| `check()` returns | `AccessControl.IDecision` | `boolean` |
| `can()` returns | `boolean` | `boolean` |
| `permissions()` returns | typed `IamClient.PermissionMap` | `Record

The role catalog is not on this tree. Over 32 roles drops both modes to the interpreter, so it changes throughput, not the mode you should pick.

Development in local development, test suites (where `explain()` turns a failing assertion into a readable trace), CI and staging — it is also the only place a table/interpreter divergence can be caught, which is the reason to keep it on in CI. Production everywhere else, and in edge runtimes where bundle size matters, since production never loads the explain chunk.

Different engines per route is possible but rarely worth it:

```ts
const debugEngine = new IamEngine({ adapter, mode: 'development' })
const prodEngine = new IamEngine<Action, Resource, Role, Scope, 'production'>({ adapter, mode: 'production' })
```

Two engines means two independent cache sets and two compiled tables, and an admin write through one does not invalidate the other unless they share an `invalidator`. Prefer one mode per process.

## Performance, honestly

Measured 2026-08-29 through the full stack - subject resolution, hooks, scope enrichment, caches and evaluation - with `engine.can()` on the same machine, two runs for stability:

| Request shape | `'production'` | `'development'` | Ratio |
| --- | --- | --- | --- |
| RBAC grant covered by the role mask | 2.62-2.92M ops/s | 0.89-0.91M ops/s | ~2.9-3.2x |
| Condition-gated ABAC cell | 1.83-1.93M ops/s | 0.90-0.93M ops/s | ~2.0-2.1x |

Development's number is the table lookup **plus** the interpreter run, since both execute on every development check. That is where the gap comes from — it is the price of provenance and of the cross-check, not two different qualities of evaluator.

The more useful framing: a fully warm production check costs roughly 950 nanoseconds, and the evaluator is about 7% of that. Half the time goes to the subject cache's LRU bookkeeping and roughly a third to the promise chain of four nested async functions. Switching modes optimises the 7%. If authorization is genuinely your bottleneck, the subject cache and the number of adapter round trips are where the time is.

Throughput does not degrade with catalog size in either mode's hot path - the compiled lookup is array indexing regardless of how many roles and policies exist. What constrains production is catalog *shape*: the 32-role cap, very wide action-by-resource grids, and policies that cannot compile because they use wildcards. See [benchmarks](/duck-iam/benchmarks) for methodology and cross-library comparisons.

## Auditing in production mode

`afterEvaluate` and `onDeny` fire in production, so a denial log keeps working when `mode` flips. What it loses is provenance: `decision.policy` and `decision.rule` are `undefined` and `reason` is a fixed string, so a log built on those fields starts recording nothing without failing. `onMutation` is unaffected — it is the write-side audit seam and reports the same events in both modes.

If the deciding rule genuinely has to be in the record:

1. Stay in development mode and pay for the second evaluator. For most services it is invisible next to database latency.
2. Audit at the call site, in your middleware or route handler, around `engine.can()`. That is also where you have the request context the engine never sees.

Chart `failOpen` either way. It is the only signal that distinguishes "allowed because a rule said so" from "allowed because nothing had anything to say and `defaultEffect` is `'allow'`".

## Gotchas

* **Naming `TMode` does not set `mode`.** The type argument and the config field are independent; pass both.
* **The compiled table is built lazily.** The first `authorize()` or `permissions()` after boot, or after any policy/role invalidation, pays one table build — in both modes. `preload()` warms it.
* **A 33rd role is not an error.** It is a silent-until-you-look throughput cliff: one `console.warn` at the first trip, then `healthCheck().compiledTable` for as long as the condition holds.
* **`explain()` throws even when the static type allowed the call.** The runtime check does not trust the generic.
* **Switching modes does not change verdicts.** The same table answers both. Development additionally cross-checks it against the interpreter and throws on a disagreement, which is a bug in duck-iam, not a mode trade-off.

## See also

* [Compiled table](/duck-iam/advanced/engine/compiled)
* [Hooks](/duck-iam/advanced/engine/hooks)
* [Engine methods](/duck-iam/advanced/engine/methods)
* [Cross-policy combining](/duck-iam/core/cross-policy)
* [Benchmarks](/duck-iam/benchmarks)