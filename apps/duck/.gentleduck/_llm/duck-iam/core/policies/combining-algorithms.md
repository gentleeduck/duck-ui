A policy's combining algorithm turns the set of rules that matched a request into one effect. It runs after targets have admitted the policy and after every rule's action, resource, and conditions have been evaluated - so its only input is the list of matched rules, in source order, and the engine's `defaultEffect`.

## Where the algorithm sits

The combiner is the last step inside one policy. What each stage before it decides is on [targets](/duck-iam/core/policies/targets), [rule matching](/duck-iam/core/rule-matching), and [conditions](/duck-iam/core/policies/conditions); what happens after is [cross-policy combining](/duck-iam/core/cross-policy).

`M` is the hand-off point: every algorithm sees the same list. `DEF` fires only when at least one rule's action/resource shape matched; otherwise the policy is NotApplicable and abstains entirely. It is one of two paths where a policy votes without a deciding rule - the other is a condition that threw, which makes the policy Indeterminate and casts a `deny` if it holds any deny rule, `defaultEffect` if it is allow-only.

## Choosing one

| Algorithm | Default? | Picks | Reads `priority`? | Use for |
| --- | --- | --- | --- | --- |
| `deny-overrides` | yes | First matched `deny`, else first matched `allow` | no | Restriction policies, guardrails, compliance layers |
| `allow-overrides` | no | First matched `allow`, else first matched `deny` | no | Permissive grants; used by the generated RBAC policy |
| `first-match` | no | Matched rule with the largest `priority`; ties keep source order | yes | Ordered, firewall-style rule lists |
| `highest-priority` | no | Same selection as `first-match` | yes | Tiered rules and emergency overrides |

`algorithm()` defaults to `'deny-overrides'` when you never call it. The type is `AccessControl.CombiningAlgorithm`:

```ts
type AccessControl.CombiningAlgorithm =
  | 'deny-overrides'
  | 'allow-overrides'
  | 'first-match'
  | 'highest-priority'
```

## deny-overrides

Any matched `deny` wins, whatever else matched and whatever the priorities are. This is the default and the conservative choice.

Priority is never read at `Q1` or `Q2`; the "first" in each branch is the earliest in the policy's rule array, and it only ever affects which rule id lands in `IDecision.rule` and `reason`, never the effect.

```ts
import { definePolicy } from '@gentleduck/iam'

const strict = definePolicy('strict-posts')
  .name('Strict Posts')
  .algorithm('deny-overrides')
  .rule('allow-read', (r) => r.allow().on('read').of('post'))
  .rule('deny-drafts', (r) =>
    r
      .deny()
      .on('read')
      .of('post')
      .when((w) => w.resourceAttr('status', 'eq', 'draft')),
  )
  .build()
```

| Request | Matched rules | Result |
| --- | --- | --- |
| `read` a published post | `allow-read` | **allow**, `Allowed by rule "allow-read"` |
| `read` a draft post | `allow-read`, `deny-drafts` | **deny**, `Denied by rule "deny-drafts"` |
| `update` a post | none - no rule covers `update` | NotApplicable, policy abstains |

The third row matters: the policy has no rule whose actions cover `update`, so it is skipped rather than voting `defaultEffect`. See [targets](/duck-iam/core/policies/targets#target-matched-no-rule-matched).

## allow-overrides

The mirror image: any matched `allow` wins. `rolesToPolicy()` builds the synthetic `__rbac__` policy with this algorithm, because a role grant should never be cancelled by another role's absence.

```ts
const premium = definePolicy('premium-content')
  .name('Premium Content')
  .algorithm('allow-overrides')
  .rule('deny-by-default', (r) => r.deny().on('*').of('premium-content'))
  .rule('vip-access', (r) =>
    r
      .allow()
      .on('*')
      .of('premium-content')
      .when((w) => w.attr('tier', 'in', ['pro', 'enterprise'])),
  )
  .build()
```

| Request | Matched rules | Result |
| --- | --- | --- |
| Free-tier subject reads premium content | `deny-by-default` | **deny**, `Denied by rule "deny-by-default"` |
| Pro-tier subject reads premium content | `deny-by-default`, `vip-access` | **allow**, `Allowed by rule "vip-access"` |

Under `allow-overrides` a single matched allow beats every deny in the same policy. Put a guardrail that must win in its own `deny-overrides` policy, where the cross-policy `and` combine will carry its deny to the final decision. See [cross-policy combining](/duck-iam/core/cross-policy).

## first-match

Named for firewall-style ordered lists, but it is priority-aware: the matched rule with the largest `priority` wins, and **only a tie** falls back to source order.

The strict `>` at `CMP` is what makes ties stable: an equal-priority rule declared later never displaces the earlier one.

```ts
const firewall = definePolicy('ip-firewall')
  .name('IP Firewall')
  .algorithm('first-match')
  .rule('block-known-bad', (r) =>
    r
      .deny()
      .on('*')
      .of('*')
      .priority(100)
      .when((w) => w.env('ip', 'in', ['10.0.0.99', '10.0.0.100'])),
  )
  .rule('allow-internal', (r) =>
    r
      .allow()
      .on('*')
      .of('*')
      .priority(50)
      .when((w) => w.env('ip', 'starts_with', '10.')),
  )
  .rule('deny-external', (r) => r.deny().on('*').of('*').priority(10))
  .build()
```

| Request `environment.ip` | Matched rules | Winner | Result |
| --- | --- | --- | --- |
| `10.0.0.99` | all three | `block-known-bad` (p=100) | **deny** |
| `10.0.0.7` | `allow-internal`, `deny-external` | `allow-internal` (p=50) | **allow** |
| `203.0.113.4` | `deny-external` | `deny-external` (p=10) | **deny** |

With `first-match` you must give the rules explicit descending priorities for the list to read top-to-bottom the way a firewall does. Rules left at the default `priority` of `10` are all tied, and only then does declaration order decide.

The tie-break is part of the contract, not an artefact of the interpreter, so the same rule wins in both [modes](/duck-iam/advanced/engine/modes). That took a fix: the compiled path groups literal-action/resource rules separately from wildcard ones and scans the literal group first, which is not source order, so a `deny read '*'` declared before an `allow read 'post'` at equal priority denied in development and allowed in production. Each indexed rule now carries its position in `policy.rules`, and the ranked scan compares that position whenever priorities are equal.

## highest-priority

`highest-priority` runs the same selection as `first-match`: scan the matched rules, keep the one with the largest priority, and let the earliest declared rule win a tie. They are one algorithm with two labels - both call the same `topByPriority`, so they cannot drift - and return the same effect and the same deciding rule for every input. Only the reason string differs (`Highest priority: rule "x" (p=100)` versus `First match: rule "x" (allow)`), which is what an operator reads in an audit log.

Choose `highest-priority` when you want the reader (and the explain trace) to understand the policy as a set of ranked tiers rather than an ordered list. Choose `first-match` when the rules are meant to be read as a sequence.

```ts
const tiered = definePolicy('classified-docs')
  .name('Classified Docs')
  .algorithm('highest-priority')
  .rule('normal-read', (r) => r.allow().on('read').of('document').priority(10))
  .rule('classified-deny', (r) =>
    r
      .deny()
      .on('read')
      .of('document')
      .priority(50)
      .when((w) => w.resourceAttr('classification', 'eq', 'top-secret')),
  )
  .rule('break-glass', (r) =>
    r
      .allow()
      .on('*')
      .of('*')
      .priority(100)
      .when((w) => w.role('incident-commander').env('breakGlass', 'eq', true)),
  )
  .build()
```

| Request | Matched rules | Winner | Result |
| --- | --- | --- | --- |
| Anyone reads a normal document | `normal-read` | p=10 | **allow** |
| Anyone reads a top-secret document | `normal-read`, `classified-deny` | `classified-deny` (p=50) | **deny** |
| Incident commander with `breakGlass` reads it | all three | `break-glass` (p=100) | **allow** |

`priority` defaults to `10` and must be a finite number - `priority(NaN)` and `priority(Infinity)` are rejected by `build()` with `INVALID_TYPE`. A row that reached the store with a non-finite priority anyway is ranked as `0` rather than losing every comparison, so it still competes with default-priority rules instead of disappearing. Details on [rules](/duck-iam/core/policies/rules#priority).

## When no rule matched

If the policy was applicable (targets matched, and at least one rule's action/resource shape covered the request) but no rule's conditions held, every algorithm returns `defaultEffect` with no deciding rule:

```ts
{
  allowed: false,
  effect: 'deny',
  policy: 'strict-posts',
  reason: 'No matching rules. Defaulted to deny',
  duration: 0.04,
  timestamp: 1770000000000,
}
```

`defaultEffect` is an engine option, not a policy option; it defaults to `'deny'`. Setting it to `'allow'` requires `allowFailOpen: true` - the engine constructor refuses the combination otherwise, in both modes. See [engine modes](/duck-iam/advanced/engine/modes).

This is why a deny-only policy can deny more than you intended: a policy whose rules are all `deny` and none of which matched still votes `deny` through the fallback. The fixes, in order of preference:

Add a trailing catch-all allow

Under `deny-overrides`, `r.allow().on('*').of('*')` as the last rule turns the policy into "allow unless one of the deny rules fires". Denies still win, because deny-overrides ignores order.

Narrow the policy with targets

`target({ actions: [...] })` makes the policy NotApplicable for everything else, so it abstains instead of voting. See [targets](/duck-iam/core/policies/targets).

Flip the engine default

`defaultEffect: 'allow'` with `allowFailOpen: true` treats every policy as a pure exception list. Only do this when something else is enforcing a baseline.

Since 5.4.0, `PolicyBuilder.build()` catches the most common version of this mistake at build time with `UNREACHABLE_TARGET`.

## API reference

The algorithm is one field on the policy:

```ts
interface AccessControl.IPolicy<TAction, TResource, TRole> {
  // ...
  readonly algorithm: AccessControl.CombiningAlgorithm
}

// PolicyBuilder
algorithm(a: AccessControl.CombiningAlgorithm): this   // default: 'deny-overrides'
```

The decision a combiner produces:

```ts
interface AccessControl.IDecision {
  readonly allowed: boolean
  readonly effect: AccessControl.Effect         // 'allow' | 'deny'
  readonly rule?: AccessControl.IRule           // absent on a defaultEffect fallback
  readonly policy?: string
  readonly reason: string
  readonly duration: number                     // ms
  readonly timestamp: number                    // epoch ms
  readonly applicable?: boolean                 // false only for NotApplicable
}
```

Reason strings, by branch:

| Branch | `reason` |
| --- | --- |
| `deny-overrides` / `allow-overrides` picked a deny | `Denied by rule "<id>"` |
| `deny-overrides` / `allow-overrides` picked an allow | `Allowed by rule "<id>"` |
| `first-match` picked a rule | `First match: rule "<id>" (<effect>)` |
| `highest-priority` picked a rule | `Highest priority: rule "<id>" (p=<priority>)` |
| No rule matched | `No matching rules. Defaulted to <effect>` |
| Targets missed | `Policy "<id>" targets do not match. Not applicable.` |
| No rule shape covered the request | `Policy "<id>" has no rule for this action/resource. Not applicable.` |

To run one policy's algorithm yourself - in a test, a migration check, or tooling - call the evaluator directly. Both are exported from `@gentleduck/iam` and `@gentleduck/iam/core`:

```ts
import { iamEvaluatePolicy, iamEvaluatePolicyFast } from '@gentleduck/iam'

const decision = iamEvaluatePolicy(strict, request, 'deny')
// AccessControl.IDecision, the development-mode shape

const verdict = iamEvaluatePolicyFast(strict, request, 'deny')
// true | false | null - null means NotApplicable, the production-mode shape
```

`iamEvaluatePolicy` takes `(policy, request, defaultEffect?, caches?)`; `defaultEffect` defaults to `'deny'`. The multi-policy entry points are `iamEvaluate` and `iamEvaluateFast`.

## Gotchas

* The algorithm only ranks rules **within** one policy. A policy that decides `allow` can still lose to another policy's deny under the default `policyCombine: 'and'`.
* `deny-overrides` and `allow-overrides` ignore `priority` completely. Setting priorities on their rules changes nothing but the explain trace's ordering commentary.
* `first-match` does not mean "first in the file" unless every matched rule shares a priority. Read it as "highest priority, then first".
* A policy with `first-match` and no explicit priorities behaves exactly like the classic first-in-the-list semantics, because every rule sits at the default `10`.
* `policyCombine: 'first-applicable'` is refused by the engine constructor in `production` mode; the per-policy algorithm is unaffected by that restriction.

## See also

* [Rules](/duck-iam/core/policies/rules) - `priority`, effect, and what makes a rule a candidate
* [Targets](/duck-iam/core/policies/targets) - NotApplicable versus a `defaultEffect` vote
* [Cross-policy combining](/duck-iam/core/cross-policy) - `policyCombine` across policies
* [Evaluation pipeline](/duck-iam/core/evaluation) - the whole request lifecycle
* [Layered policy example](/duck-iam/core/policies/example-layered) - all four algorithms in one policy set