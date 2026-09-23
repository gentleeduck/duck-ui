duck-iam is one access-control engine with two authoring models. Roles (RBAC) are concise for "who can do what"; policies (ABAC) express "under which conditions". They are written differently but evaluated identically: role permissions are compiled into a synthetic policy, that policy joins your hand-written ones, and every check walks the same evaluator. This page fixes the vocabulary and routes you to the page that documents each part.

## One evaluator, two authoring models

The two models converge before anything is evaluated, so a role grant and a policy rule are the same kind of object by the time a decision is made.

`rolesToPolicy()` turns every permission of every role into one allow rule guarded by a `subject.roles contains 

| Page | Covers |
| --- | --- |
| [primitives](/duck-iam/core/primitives) | Every exported type in the request, policy, and decision vocabulary, field by field. |
| [evaluation pipeline](/duck-iam/core/evaluation) | Subject resolution, scoped-role enrichment, policy-set assembly, per-policy evaluation, the decision. |
| [rule matching](/duck-iam/core/rule-matching) | Action and resource patterns, condition groups, field resolution, every operator's edge semantics. |
| [cross-policy combination](/duck-iam/core/cross-policy) | NotApplicable semantics, the three `policyCombine` modes, `defaultEffect`, defense in depth. |
| [roles](/duck-iam/core/roles) | Defining roles, inheritance, scoped roles, conditional permissions, the `rolesToPolicy` output. |
| [policies](/duck-iam/core/policies) | The policy builder, rules, targets, conditions, nesting, combining algorithms. |

## Why hybrid

RBAC alone expresses "editors update posts" but not "editors update posts they own, during business hours, from an allowed region". ABAC alone makes every ordinary grant a hand-written rule, which is verbose for the eighty percent case.

duck-iam lets you keep both:

* Common grants stay roles. Concise, easy to audit, easy to hand to an admin UI through `engine.admin`.
* Contextual restrictions stay policies. Time windows, ownership, geo-fencing, feature flags, break-glass.
* Both contribute to one decision through the configured cross-policy combine, which defaults to strict AND.

## When to use / When not to use

Use the core engine directly when you need a decision inside your own code path: a resolver, a job runner, a service-to-service call. Use it through a [server integration](/duck-iam/integrations/server) when the decision guards an HTTP route, so subject and scope extraction is done for you.

Do not reach for a policy when a role would do. A policy exists to say something a role cannot: a condition on request context, a deny, or a restriction that must apply regardless of who is asking. A policy set of three to five well-named concerns is far easier to audit than twenty overlapping ones.

Do not use `engine.explain()` on a hot path. It is `development`-mode only, allocates a full trace, and throws when the engine is in `production` mode.

## Gotchas

### Are roles just shorthand for policies?

At evaluation time, yes: `rolesToPolicy()` materialises them into the `__rbac__` policy so roles and ABAC rules run through the same evaluator. You still model them separately, because roles are the better authoring surface for ordinary grants and policies are the better surface for contextual logic.

### The `__rbac__` policy is omitted when it has no rules

The engine merges `[__rbac__, ...adapterPolicies]` only when the generated policy has at least one rule. Roles that exist but grant nothing produce an empty rule list, and the policy is dropped rather than joining the combine as a silent participant.

### What happens when nothing matches?

`defaultEffect` decides, and it is `'deny'` unless you change it. A policy whose targets do not match is skipped entirely rather than folded in as a default vote - see [NotApplicable semantics](/duck-iam/core/cross-policy). Setting `defaultEffect: 'allow'` additionally requires `allowFailOpen: true`; the engine constructor throws without it and logs a startup warning even with it.

### The cross-policy combine is configurable

Since 2.0.0 the engine takes `policyCombine` (`'and'` by default, plus `'allow-overrides'` and `'first-applicable'`). Older documentation described the AND as fixed engine behaviour; it is not. See [cross-policy combination](/duck-iam/core/cross-policy).

### scope, environment, or resource attribute?

Put a tenant identifier in `scope` when it should activate scoped role assignments and scope-restricted permissions - that is the only one of the three the subject resolver reads. Put it in `environment` or `resource.attributes` when it is only extra context for conditions and must not change which roles a subject holds.

## See also

* [Primitives](/duck-iam/core/primitives) - the exact shape of every type named above.
* [Evaluation pipeline](/duck-iam/core/evaluation) - what happens between `engine.can()` and a decision.
* [Cross-policy combination](/duck-iam/core/cross-policy) - how per-policy verdicts merge.
* [Engine modes](/duck-iam/advanced/engine/modes) - what changes between `development` and `production`.