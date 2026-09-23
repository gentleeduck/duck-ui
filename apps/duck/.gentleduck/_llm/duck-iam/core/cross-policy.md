A decision is produced in two stages. Inside a policy, the [combining algorithm](/duck-iam/core/policies/combining-algorithms) folds matching rules into one effect. Across policies, the engine merges those per-policy verdicts using `policyCombine`. This page documents the second stage: what counts as a verdict, what counts as silence, and what each of the three modes does with them.

## A policy produces one of three outcomes

`evaluatePolicy()` never returns "nothing". It returns allow, deny, or a decision explicitly marked NotApplicable. Only the first two are votes.

The distinction the diagram turns on is between a policy that has nothing to say and one that considered the request and answered. Three things make a policy NotApplicable:

1. **Targets miss.** A declared `targets.actions`, `targets.resources`, or `targets.roles` dimension does not match. Reason: `Policy "

| Mode | Rule | When to use |
| --- | --- | --- |
| `'and'` (default) | Every applicable policy must allow. The first non-allow wins and stops the walk. | Defense in depth. Each new policy can only restrict access, and each is auditable on its own. |
| `'allow-overrides'` | Any applicable allow wins. Only if all applicable policies deny is the result a deny. | Layered grants where one permissive policy must beat stricter ones - break-glass roles, support escalation. |
| `'first-applicable'` | The first policy that produces a decision **with a deciding rule** wins. A policy that was applicable but fell back to `defaultEffect` does not decide. | Ordered-by-specificity policy sets, XACML style, where policy order is deliberately part of the security model. |

The engine constructor throws when `mode: 'production'` is combined with `policyCombine: 'first-applicable'`, because the fast path cannot represent it faithfully. The message names both: `policyCombine 'first-applicable' requires mode 'development'`. In development the pair is accepted, but `_getCompiledTable()` returns `null` for it and every request runs on the interpreter.

Each mode has its own fall-through reason string when nothing applied, which is the fastest way to identify the mode from a log line:

| Mode | Fall-through reason |
| --- | --- |
| `'and'` | `No policy applicable. Defaulted to 

The `admin-only` policy targets `actions: ['admin:*']`, so it never applies to this request and never votes. That is what makes layering safe: adding a policy scoped to a different concern cannot accidentally deny everything else.

```ts
import { definePolicy } from '@gentleduck/iam'

const businessHours = definePolicy('business-hours')
  .name('Business hours')
  .target({ actions: ['create', 'update', 'delete'] })
  .algorithm('first-match')
  .rule('deny-off-hours', (r) =>
    r.deny().on('create', 'update', 'delete').of('*').when((w) => w.env('hour', 'lt', 9)),
  )
  .rule('allow-in-hours', (r) => r.allow().on('*').of('*'))
  .build()

const contentSafety = definePolicy('content-safety')
  .name('Content safety')
  .algorithm('deny-overrides')
  .rule('block-banned', (r) =>
    r.deny().on('*').of('*').when((w) => w.attr('banned', 'eq', true)),
  )
  .rule('owner-delete-only', (r) =>
    r.allow().on('delete').of('post').when((w) => w.isOwner()),
  )
  .build()
```

Both policies join the merged array alongside `__rbac__`. Order does not matter under `'and'` - the operator is commutative - but it does matter under `'first-applicable'`.

## Defense in depth

The AND default is what lets you split authorization into one policy per concern.

Each policy file represents one concern and can be reviewed on its own. Adding a layer can only remove access, never grant it, so a new restriction cannot silently weaken an existing one. If you need OR semantics for one specific case, prefer encoding it inside a single policy with `algorithm: 'allow-overrides'` rather than switching the engine-wide `policyCombine`: same effect, much smaller blast radius.

## The default effect

`defaultEffect` is `'deny'` and applies in three places:

* Inside a policy, when rules cover the request but none of them match.
* After the cross-policy walk, when every policy was NotApplicable.
* When the policy list is empty.

A policy whose targets do not match is *not* folded in as the default; it is skipped. That is the difference this page's first section is about.

```ts
const engine = new IamEngine({
  adapter,
  defaultEffect: 'deny', // this is the default
})
```

The constructor throws unless you also pass `allowFailOpen: true`, and even then it logs a startup warning so an operator grepping for fail-open configurations always finds it. Choose it only when your policies are written as deny exceptions on top of a deliberately open baseline.

The evaluator also exposes a `failOpen` signal for exactly this case. When an allow is produced by the `defaultEffect` fallback with no applicable policy, the optional `signals` out-parameter has `failOpen` set to `true`, and the engine forwards it on the `onMetrics` event. Chart it: a rising fail-open rate is how a broken adapter or a mass policy deletion becomes visible, since the boolean verdict alone hides it.

## What changes on the compiled path

The combine semantics are identical; the mechanics differ in two visible ways. The split is between the two evaluators, not between the two modes - the compiled table produces the verdict in **both** modes, and the interpreter runs alongside it in development, or in either mode when the table could not be built.

| | interpreter (`evaluate`) | compiled table |
| --- | --- | --- |
| Deny short-circuit under `'and'` | yes - remaining policies are not evaluated | no - every vote is collected, then folded with `every` |
| Abstention | `applicable: false` on the decision | `null` from `evaluatePolicyFast`, or an omitted vote in the lookup |
| `'first-applicable'` | supported | cannot be represented; the table is skipped, and the constructor refuses the pair in production |
| `'allow-overrides'` | first allow wins, stops | all votes collected, folded with `some` |

The compiled lookup collects three kinds of vote - the flat ABAC vote, one RBAC vote, and one per residual policy that could not be flattened - drops the abstentions, and returns `every` for `'and'` or `some` for `'allow-overrides'`. When no vote survives, it falls back to `defaultEffect` and raises the same `failOpen` signal.

`compiled.differential.test.ts` and `compiled.combine-invariance.test.ts` run the compiled path against the reference evaluator across generated policy sets and assert identical verdicts, including for NotApplicable cases. A disagreement is a bug in the compiler, not a documented mode difference.

## A rotten policy never fails the request

Both `evaluate()` and the compiled lookup wrap each policy evaluation. If one throws - a malformed condition loaded from an adapter row, a regex input over the 2048-character cap - the error goes to `onPolicyError` and that policy is treated as NotApplicable. The remaining policies still decide.

This is deliberate and it cuts both ways: a broken deny policy stops denying. Wire `onPolicyError` to an alert, not to a log line nobody reads.

## When to use / When not to use

Stay on `'and'` for almost every application. It is the only mode where adding a policy is guaranteed to be safe.

Move to `'allow-overrides'` only when you have a deliberate "this permissive policy must win" pattern and you have written down which policy that is. Under this mode a single misconfigured policy can grant access that every other policy denies.

Move to `'first-applicable'` only when the ordering of your policy list is itself part of the security model, and accept that you are then pinned to `development` mode. If you want ordering *within* one concern, use `first-match` or `highest-priority` as the policy's own combining algorithm instead - that keeps the ordering local and leaves the engine on the safe default.

## Gotchas

* **A policy that considered the request and found nothing still votes.** Only a targets miss, a shape miss, or a throw abstains. Under `'and'` with `defaultEffect: 'deny'`, that vote is a deny.
* **`targets.roles` is exact membership**, not a pattern match, and it is tested against the *enriched* `subject.roles`, so scoped roles count.
* **Policy targets use the flat resource matcher.** `matchesResource`, not the hierarchical one - a bare target `dashboard` does not apply to `dashboard.users`. Write `dashboard.*`.
* **`'first-applicable'` needs a deciding rule.** A policy that applied but fell back to `defaultEffect` is skipped by this mode and the walk continues.
* **`evaluateFast()` has no `'first-applicable'` branch.** It falls through to the `'and'` behaviour; the engine constructor is what prevents you from reaching that state.
* **Short-circuiting belongs to the interpreter, not to a mode.** The compiled table produces the verdict in both modes and collects every vote, so the reasoning that "my expensive policy runs last so it rarely runs" does not hold anywhere.

## See also

* [Evaluation pipeline](/duck-iam/core/evaluation) - where the per-policy verdicts come from.
* [Combining algorithms](/duck-iam/core/policies/combining-algorithms) - the first stage, inside one policy.
* [Targets](/duck-iam/core/policies/targets) - authoring the gate that decides applicability.
* [Layered example](/duck-iam/core/policies/example-layered) - a complete multi-policy walkthrough.
* [Primitives](/duck-iam/core/primitives) - the `IDecision.applicable` field and `AccessControl.PolicyCombine`.