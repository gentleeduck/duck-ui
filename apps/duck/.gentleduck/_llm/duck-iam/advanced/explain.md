When a decision is wrong, `engine.explain()` tells you exactly why. It runs the same
evaluation the engine runs, but traces every policy, every rule, and every condition leaf
instead of stopping at the first answer.

## When to use

* A `can()` / `check()` / `authorize()` call returns the wrong answer and you need the
  deciding rule.
* You are building an internal support tool that answers "why can't this user do X?".
* You want to see which conditions failed and what values they actually resolved to.

## When not to use

* In the hot path. `explain()` never short-circuits: it evaluates every rule of every
  policy and allocates a trace node per condition. Use `can()` for decisions.
* In `production` mode. The method throws (see below).
* As an end-user-facing response. The trace carries full rule contents, condition
  operands, and `subject.attributes`.

## Availability and mode

`explain()` is typed and guarded as a `development`-mode method:

```ts
async explain(
  this: IamEngine<TAction, TResource, TRole, TScope, 'development'>,
  subjectId: string,
  action: TAction,
  resource: IamRequest.IResource<TResource>,
  environment?: IamRequest.IAccessRequest<TAction, TResource, TScope>['environment'],
  scope?: TScope,
): Promise<Explain.IResult>
```

| Guard | Behaviour |
|---|---|
| `mode: 'production'` | Throws `Error('explain() is not available in production mode')` |
| `subjectId` not a string, empty, or over 1024 chars | Throws `[@gentleduck/iam:engine] explain(): subjectId must be a non-empty string <=1024 chars` |

The explain module is loaded with a dynamic `import('../explain')` *after* the mode check,
so a production bundle never pulls in the explain chunk at all.

`explain()` is diagnostic, not observable. It runs `beforeEvaluate` (so the traced request
matches what a real evaluation would see, and a throwing hook rejects the explain call) and
then defaults the evaluation clock. It does **not** run `afterEvaluate`, `onDeny`,
`onError`, `onPolicyError`, or `onMetrics`, and it does not write to any cache except the
shared policy/role loaders.

`explain()` also runs **no validator**. It reads whatever the loaders handed over.

### The reserved refusal token

The engine denies any request naming the reserved token `'unknown'` before consulting a
policy, and `explain()` forces the same verdict: if `request.action` or
`request.resource.type` is that token, the final effect becomes `deny` with
`failure: 'input'`, `reason` `Denied: the request names the reserved refusal token, which
no policy can grant`, and `decision.policy` / `decision.rule` cleared.

The **policy traces are kept**, deliberately. Seeing which wildcard rule would have matched
is the whole reason to open `explain()` on a refused request; what must not happen is the
summary disagreeing with the engine. Until recently it did: `explain()` ran the combine over
the traces and reported whatever the policies said, so a subject holding the ordinary
`.on('*').of('*')` admin grant was explained as ALLOWED on a request the engine denies —
on exactly the requests the framework adapters mint the token for, an unmappable HTTP method
and a path the traversal guard refused to resolve.

So a trace can show `policies[i].result: 'allow'` while `decision.effect` is `'deny'`. When
`decision.failure` is `'input'`, the traces are context, not the verdict.

The trace contains every rule body, every condition operand, and the subject's full
attribute bag. Never return it to an unauthenticated caller. If you expose a debug
endpoint, gate it behind the same admin authorization you use for
[`engine.admin`](/duck-iam/advanced/engine/admin).

## How a trace is built

The pipeline below shows the call graph inside `explainEvaluation`, from the policy list
down to the summary string.

Three things in that graph are easy to miss:

* `tracePolicy` runs for **every** policy, including ones whose targets do not match. A
  non-matching policy still produces an `IPolicyTrace`, with `targetMatch: false`, an empty
  `rules` array, and `result` set to the engine's `defaultEffect`.
* `traceGroup` is depth-capped at `MAX_TRACE_DEPTH = 10`, and past it it **throws**
  `IamConditionGroupError` rather than returning `false`. `traceRule` catches that, records
  the message on the rule trace's `conditionError` field, and leaves `conditions` as an
  empty failing `all` group. `tracePolicy` then casts the Indeterminate vote the decision
  path casts — see [when a condition cannot be traced](#when-a-condition-cannot-be-traced).
* `applyCombiner` reproduces the per-policy combining algorithm; `decideFinal` then applies
  the cross-policy `policyCombine` strategy. They are two separate steps and both appear in
  the output: the per-policy result on each `IPolicyTrace`, the final one on `decision`.

## API reference

### `explainEvaluation`

Exported from `@gentleduck/iam/core/explain` (and, since `core/index.ts` re-exports
`./explain`, from `@gentleduck/iam` and `@gentleduck/iam/core` too). Call it directly when
you already have policies and a request and do not want an engine.

```ts
export function explainEvaluation(
  policies: AccessControl.IPolicy[],
  request: IamRequest.IAccessRequest,
  defaultEffect: AccessControl.Effect,
  subjectInfo: Explain.ISubjectInfo,
  combine: AccessControl.PolicyCombine = 'and',
): Explain.IResult
```

| Parameter | Type | Default | Meaning |
|---|---|---|---|
| `policies` | `AccessControl.IPolicy[]` | required | Every policy to trace. Traced in array order; the engine puts the synthetic `__rbac__` policy first. |
| `request` | `IamRequest.IAccessRequest` | required | The access request, subject already resolved and enriched. |
| `defaultEffect` | `AccessControl.Effect` | required | Effect recorded when no rule fires inside a policy, and when no policy is applicable. |
| `subjectInfo` | `Explain.ISubjectInfo` | required | Subject id plus base roles and scope-derived roles, kept separate. |
| `combine` | `AccessControl.PolicyCombine` | `'and'` | Cross-policy strategy: `'and'`, `'allow-overrides'`, or `'first-applicable'`. |

Returns an `Explain.IResult`. Throws nothing of its own; a malformed policy will surface as
whatever the underlying matcher throws.

`tracePolicy` and `traceRule` are internal — `@gentleduck/iam/core/explain` exports exactly
`explainEvaluation`, `iamEscapeHtml` and the `Explain` type namespace. To trace one policy,
call `explainEvaluation` with a single-element array.

### `iamEscapeHtml`

Also exported from `@gentleduck/iam/core/explain`.

```ts
export function iamEscapeHtml(s: string): string
```

Replaces `&`, `<`, `>`, `"`, and `'` with their HTML entities, in that order so the
ampersand rule cannot double-escape. The explain pipeline never escapes for any specific
rendering target, so run `summary` and any condition `actual` / `expected` string through
this before injecting it into HTML.

## Trace shape, field by field

The result is a tree: one `IResult`, many `IPolicyTrace`, many `IRuleTrace` per policy, and
a recursive condition tree of `IGroupTrace` and `ILeafTrace` per rule.

Every arrow above is a real property name. `IGroupTrace.children` is the one heterogeneous
list: it holds `ILeafTrace` and `IGroupTrace` values interleaved, which is why
`Explain.Trace` exists as the union you switch on.

### `Explain.IResult`

```ts
interface IResult {
  readonly decision: AccessControl.IDecision
  readonly request: {
    readonly action: string
    readonly resourceType: string
    readonly resourceId?: string
    readonly scope?: string
  }
  readonly subject: {
    readonly id: string
    readonly roles: readonly string[]
    readonly scopedRolesApplied: readonly string[]
    readonly attributes: Readonly<Record<string, IamPrimitives.AttributeValue>>
  }
  readonly policies: readonly IPolicyTrace[]
  readonly summary: string
}
```

| Field | Type | Meaning |
|---|---|---|
| `decision` | `AccessControl.IDecision` | The final decision, identical in shape to what `check()` returns. |
| `request.action` | `string` | Copied from `request.action`. |
| `request.resourceType` | `string` | Copied from `request.resource.type`. |
| `request.resourceId` | `string \| undefined` | Copied from `request.resource.id`. |
| `request.scope` | `string \| undefined` | Copied from `request.scope`. |
| `subject.id` | `string` | The `subjectId` argument, not the resolved subject's id field. |
| `subject.roles` | `readonly string[]` | Base roles, captured **before** scope enrichment. |
| `subject.scopedRolesApplied` | `readonly string[]` | Roles the scope added on top of the base set. Empty when no scope was passed or the subject holds no scoped assignments. |
| `subject.attributes` | `Record<string, AttributeValue>` | The resolved subject's attribute bag, taken from `request.subject.attributes`. |
| `policies` | `readonly IPolicyTrace[]` | One entry per policy, in load order. Never filtered. |
| `summary` | `string` | Multi-line human-readable text. Unescaped; see `iamEscapeHtml`. |

`decision` is the standard `AccessControl.IDecision`:

| Field | Type | Meaning |
|---|---|---|
| `allowed` | `boolean` | `effect === 'allow'`. |
| `effect` | `'allow' \| 'deny'` | Final effect after the cross-policy combine. |
| `rule` | `AccessControl.IRule \| undefined` | The deciding rule object. `undefined` on the default-effect path where no rule fired. |
| `policy` | `string \| undefined` | Id of the policy that decided. `undefined` on the default-effect path. |
| `reason` | `string` | Same string as the deciding policy trace's `reason`, or the default-effect message. |
| `duration` | `number` | Milliseconds spent inside `explainEvaluation`, from `performance.now()`. |
| `timestamp` | `number` | `Date.now()` at the end of the trace. |
| `failure` | `'input' \| 'resolution' \| 'evaluation' \| undefined` | Set only when the deny came from the engine failing rather than a policy saying no. In a trace this is `'input'`, for the reserved refusal token. |

### `Explain.IPolicyTrace`

```ts
interface IPolicyTrace {
  readonly policyId: string
  readonly policyName: string
  readonly algorithm: AccessControl.CombiningAlgorithm
  readonly targetMatch: boolean
  readonly rules: readonly IRuleTrace[]
  readonly result: AccessControl.Effect
  readonly reason: string
  readonly decidingRuleId?: string
  readonly decidingRule?: AccessControl.IRule
}
```

| Field | Meaning |
|---|---|
| `policyId` / `policyName` | Copied from the policy. The RBAC policy is `__rbac__` / `"RBAC Policies"`. |
| `algorithm` | The policy's combining algorithm: `deny-overrides`, `allow-overrides`, `first-match`, or `highest-priority`. |
| `targetMatch` | `false` when `targets.actions`, `targets.resources`, or `targets.roles` excluded the request. `rules` is then empty and `result` is the engine `defaultEffect`. Use this field, not `result`, to tell "policy did not apply" from "policy denied". |
| `rules` | One `IRuleTrace` per rule, in declaration order, matched or not. |
| `result` | The policy's own effect after its combining algorithm. |
| `reason` | Generated by the combiner. See the reason-string table below. |
| `decidingRuleId` | Id of the rule the combiner picked. Absent when no rule matched. |
| `decidingRule` | The rule object itself, looked up from `policy.rules` by that id. |

The exact `reason` strings, straight from `applyCombiner` and `tracePolicy`:

| Situation | `reason` |
|---|---|
| Targets excluded the request | `Policy "<id>" targets do not match. Defaulted to <defaultEffect>` |
| `deny-overrides` or `allow-overrides` picked a deny | `Denied by rule "<ruleId>"` |
| `deny-overrides` or `allow-overrides` picked an allow | `Allowed by rule "<ruleId>"` |
| `first-match` picked a rule | `First match: rule "<ruleId>" (<effect>)` |
| `highest-priority` picked a rule | `Highest priority: rule "<ruleId>" (p=<priority>)` |
| No rule matched | `No matching rules. Defaulted to <defaultEffect>` |

`first-match` is not "the first rule in the array": it scans the matched rules and keeps the
one with the highest `rulePriority`, so it agrees with the fast and compiled paths.

### `Explain.IRuleTrace`

```ts
interface IRuleTrace {
  readonly ruleId: string
  readonly description?: string
  readonly effect: AccessControl.Effect
  readonly priority: number
  readonly actionMatch: boolean
  readonly resourceMatch: boolean
  readonly conditionsMet: boolean
  readonly conditions: IGroupTrace
  readonly matched: boolean
  readonly conditionError?: string
}
```

| Field | Meaning |
|---|---|
| `actionMatch` | `rule.actions.some(a => matchesAction(a, req.action))`. |
| `resourceMatch` | If either the pattern or the request resource type contains a `.`, `matchesResourceHierarchical` is used; otherwise `matchesResource`. |
| `conditionsMet` | The root condition group's `result`. |
| `conditions` | The full condition tree, always present, even for `{ all: [] }` (which is `result: true` with no children). |
| `matched` | `actionMatch && resourceMatch && conditionsMet`. Only matched rules reach the combiner. |
| `conditionError` | Present only when tracing the condition tree threw. Absent on every rule that evaluated normally. |

Conditions are traced regardless of whether the action or resource matched, so a rule that
failed on `actionMatch` still shows you what its conditions would have done.

#### When a condition cannot be traced

A condition can be unanswerable rather than false: a group nested past `MAX_TRACE_DEPTH`, an
operand of the wrong type, a `matches` pattern read from request data, a pattern that will
not compile. `traceRule` catches the throw, puts the message on `conditionError`, and sets
`conditions` to an empty failing `all` group — so `matched` reads `false` on that rule.

Do not read that as "the rule did not apply". `tracePolicy` checks for any rule carrying a
`conditionError` **before** running the combiner, and casts the Indeterminate vote instead:

| Policy contains | `result` | `reason` |
|---|---|---|
| at least one `deny` rule | `deny` | `Policy evaluation error - denied (indeterminate)` |
| allow rules only | the engine `defaultEffect` | `Policy evaluation error - defaulted to <effect> (indeterminate)` |

That is the same vote the decision path casts, computed with the same `policyHasDenyRule`
helper rather than a second reading of the rule list. Reporting a deny rule as merely "not
matching" would make the trace disagree with the engine on exactly the request the operator
opened it to understand.

### `Explain.IGroupTrace` and `Explain.ILeafTrace`

```ts
interface IGroupTrace {
  readonly type: 'group'
  readonly logic: 'all' | 'any' | 'none'
  readonly result: boolean
  readonly children: ReadonlyArray<ILeafTrace | IGroupTrace>
}

interface ILeafTrace {
  readonly type: 'condition'
  readonly field: string
  readonly operator: AccessControl.Operator
  readonly expected: IamPrimitives.AttributeValue
  readonly actual: IamPrimitives.AttributeValue
  readonly result: boolean
}

type Trace = ILeafTrace | IGroupTrace
```

| Logic | `result` |
|---|---|
| `all` | `children.every(c => c.result)` |
| `any` | `children.some(c => c.result)` |
| `none` | `children.every(c => !c.result)` |
| unknown key, or depth `>= 10` | the group throws; the rule trace records `conditionError` and shows `logic: 'all'`, `result: false`, no children |

On a leaf, `actual` is `resolve(request, cond.field)` and `expected` is
`iamResolveConditionValue(request, cond.value ?? null)`. That means `expected` is the value
*after* `$`-path resolution: a condition written `value: '$subject.id'` shows the resolved
subject id, not the literal `'$subject.id'`. `result` is
`iamEvaluateOperator(cond.operator, actual, expected)`.

### `Explain.ISubjectInfo`

The fifth thing `explainEvaluation` needs, and the shape custom explain tooling must build.

```ts
interface ISubjectInfo {
  subjectId: string
  originalRoles: readonly string[]
  scopedRolesApplied: readonly string[]
}
```

The engine computes `scopedRolesApplied` as the enriched role list minus the original one,
so a scoped role the subject already held directly does not appear twice.

## A real trace

Given these roles and this policy:

```ts
import { defineRole, definePolicy } from '@gentleduck/iam/core/builder'

const editor = defineRole('editor')
  .name('Editor')
  .grant('read', 'post')
  .grant('update', 'post')
  .build()

const ownership = definePolicy('post-ownership')
  .name('Post ownership')
  .algorithm('deny-overrides')
  .target({ resources: ['post'] })
  .rule('owner-can-update', (r) =>
    r.allow().priority(10).on('update').of('post').when((w) => w.isOwner()),
  )
  .rule('deny-foreign-update', (r) =>
    r.deny().priority(100).on('update').of('post').when((w) => w.not((n) => n.isOwner())),
  )
  .build()
```

And this call, where `u-42` holds the `editor` role but the post belongs to `u-99`:

```ts
const trace = await engine.explain('u-42', 'update', {
  type: 'post',
  id: 'p-7',
  attributes: { ownerId: 'u-99' },
})
```

The trace comes back as:

```json
{
  "decision": {
    "allowed": false,
    "effect": "deny",
    "policy": "post-ownership",
    "reason": "Denied by rule \"deny-foreign-update\"",
    "duration": 0.41,
    "timestamp": 1756771200000,
    "rule": {
      "id": "deny-foreign-update",
      "effect": "deny",
      "priority": 100,
      "actions": ["update"],
      "resources": ["post"],
      "conditions": {
        "all": [
          {
            "none": [
              { "field": "resource.attributes.ownerId", "operator": "eq", "value": "$subject.id" }
            ]
          }
        ]
      }
    }
  },
  "request": {
    "action": "update",
    "resourceType": "post",
    "resourceId": "p-7"
  },
  "subject": {
    "id": "u-42",
    "roles": ["editor"],
    "scopedRolesApplied": [],
    "attributes": { "tier": "pro" }
  },
  "policies": [
    {
      "policyId": "__rbac__",
      "policyName": "RBAC Policies",
      "algorithm": "allow-overrides",
      "targetMatch": true,
      "result": "allow",
      "reason": "Allowed by rule \"__rbac__#1\"",
      "decidingRuleId": "__rbac__#1",
      "rules": [
        {
          "ruleId": "__rbac__#0",
          "description": "Editor: read on post",
          "effect": "allow",
          "priority": 10,
          "actionMatch": false,
          "resourceMatch": true,
          "conditionsMet": true,
          "matched": false,
          "conditions": {
            "type": "group",
            "logic": "all",
            "result": true,
            "children": [
              {
                "type": "condition",
                "field": "subject.roles",
                "operator": "contains",
                "expected": "editor",
                "actual": ["editor"],
                "result": true
              }
            ]
          }
        },
        {
          "ruleId": "__rbac__#1",
          "description": "Editor: update on post",
          "effect": "allow",
          "priority": 10,
          "actionMatch": true,
          "resourceMatch": true,
          "conditionsMet": true,
          "matched": true,
          "conditions": {
            "type": "group",
            "logic": "all",
            "result": true,
            "children": [
              {
                "type": "condition",
                "field": "subject.roles",
                "operator": "contains",
                "expected": "editor",
                "actual": ["editor"],
                "result": true
              }
            ]
          }
        }
      ]
    },
    {
      "policyId": "post-ownership",
      "policyName": "Post ownership",
      "algorithm": "deny-overrides",
      "targetMatch": true,
      "result": "deny",
      "reason": "Denied by rule \"deny-foreign-update\"",
      "decidingRuleId": "deny-foreign-update",
      "rules": [
        {
          "ruleId": "owner-can-update",
          "effect": "allow",
          "priority": 10,
          "actionMatch": true,
          "resourceMatch": true,
          "conditionsMet": false,
          "matched": false,
          "conditions": {
            "type": "group",
            "logic": "all",
            "result": false,
            "children": [
              {
                "type": "condition",
                "field": "resource.attributes.ownerId",
                "operator": "eq",
                "expected": "u-42",
                "actual": "u-99",
                "result": false
              }
            ]
          }
        },
        {
          "ruleId": "deny-foreign-update",
          "effect": "deny",
          "priority": 100,
          "actionMatch": true,
          "resourceMatch": true,
          "conditionsMet": true,
          "matched": true,
          "conditions": {
            "type": "group",
            "logic": "all",
            "result": true,
            "children": [
              {
                "type": "group",
                "logic": "none",
                "result": true,
                "children": [
                  {
                    "type": "condition",
                    "field": "resource.attributes.ownerId",
                    "operator": "eq",
                    "expected": "u-42",
                    "actual": "u-99",
                    "result": false
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ],
  "summary": "DENIED: \"u-42\" attempting update on post\n  Roles: [editor]\n  __rbac__ [allow-overrides]: Allowed by rule \"__rbac__#1\" (1/2 rules matched)\n  post-ownership [deny-overrides]: Denied by rule \"deny-foreign-update\" (1/2 rules matched)\n  Result: Denied by rule \"deny-foreign-update\""
}
```

Read it top-down:

* The RBAC policy allowed. Rule `__rbac__#0` failed only on `actionMatch` (it grants
  `read`, the request was `update`); `__rbac__#1` matched, and `allow-overrides` picked it.
* `post-ownership` denied. `owner-can-update` failed because its single leaf resolved
  `expected: "u-42"` (the `$subject.id` reference) against `actual: "u-99"`.
* `deny-foreign-update` wraps the same leaf in a `none` group (that is what `w.not(...)`
  emits, nested inside the `all` group `when()` always produces). A failing leaf makes the
  `none` group `true`, which makes the outer `all` `true`. The rule matched, and
  `deny-overrides` picked it.
* The default cross-policy combine is `'and'`, and one applicable policy denied, so
  `decision.effect` is `deny` and `decision.rule` is the whole `deny-foreign-update` object.

## The summary string

`buildSummary` produces one line per section, joined with `\n`:

```text
DENIED: "u-42" attempting update on post
  Roles: [editor]
  __rbac__ [allow-overrides]: Allowed by rule "__rbac__#1" (1/2 rules matched)
  post-ownership [deny-overrides]: Denied by rule "deny-foreign-update" (1/2 rules matched)
  Result: Denied by rule "deny-foreign-update"
```

The exact templates:

| Line | Template |
|---|---|
| Header | `<ALLOWED\|DENIED>: "<subjectId>" attempting <action> on <resourceType>` plus ` [scope: <scope>]` when a scope was passed |
| Roles, no scoped roles | `  Roles: [<originalRoles>]` |
| Roles, with scoped roles | `  Roles: [<originalRoles>] + scoped: [<scopedRolesApplied>]` |
| Policy, targets excluded it | `  <policyId>: targets don't match (<result>)` |
| Policy, a rule decided | `  <policyId> [<algorithm>]: <reason> (<matched>/<total> rules matched)` |
| Policy, no rule decided | `  <policyId> [<algorithm>]: no matching rules. Defaulted to <result> (0/<total> rules evaluated)` |
| Footer | `  Result: <decision.reason>` |

`summary` interpolates policy ids, role ids, and the subject id verbatim. Policy names are
operator-controlled; subject ids often come from a request path. Run it through
`iamEscapeHtml` from `@gentleduck/iam/core/explain` before rendering it into HTML.

## Cross-policy combine in the trace

`decideFinal` skips every trace whose `targetMatch` is `false` — a non-applicable policy
contributes nothing in any mode — and then applies the engine's `policyCombine`:

| `policyCombine` | Rule |
|---|---|
| `'and'` (default) | The first applicable policy whose `result` is not `allow` decides the deny. If every applicable policy allowed, the last one is credited with the allow. |
| `'allow-overrides'` | The first applicable policy whose `result` is `allow` decides. Otherwise the last denying policy is credited. |
| `'first-applicable'` | The first applicable policy that has a `decidingRule` decides, effect and all. |
| No applicable policy | `defaultEffect`, reason `No applicable policy across <n> policies. Defaulted to <effect>` |
| Applicable policies but no rule fired | `defaultEffect`, reason `No matching rules across <n> applicable policies. Defaulted to <effect>` |
| No policies configured at all | `defaultEffect`, reason `No policies configured` |

See [cross-policy combining](/duck-iam/core/cross-policy) for how the same strategies apply
on the non-trace path.

## Walking the trace

Print which condition failed, and why:

```ts
import type { Explain } from '@gentleduck/iam'

function printConditions(trace: Explain.Trace, indent = ''): void {
  if (trace.type === 'condition') {
    const mark = trace.result ? 'PASS' : 'FAIL'
    console.log(
      `${indent}[${mark}] ${trace.field} ${trace.operator} ${JSON.stringify(trace.expected)} ` +
        `(actual: ${JSON.stringify(trace.actual)})`,
    )
    return
  }
  console.log(`${indent}${trace.logic} (${trace.result ? 'PASS' : 'FAIL'}):`)
  for (const child of trace.children) printConditions(child, `${indent}  `)
}

const trace = await engine.explain('u-42', 'update', {
  type: 'post',
  id: 'p-7',
  attributes: { ownerId: 'u-99' },
})

for (const policy of trace.policies) {
  if (!policy.targetMatch) {
    console.log(`${policy.policyId}: skipped, targets do not match`)
    continue
  }
  for (const rule of policy.rules) {
    const why: string[] = []
    if (!rule.actionMatch) why.push('action mismatch')
    if (!rule.resourceMatch) why.push('resource mismatch')
    if (!rule.conditionsMet) why.push('conditions failed')
    console.log(`  ${rule.matched ? 'MATCH' : 'SKIP '} ${rule.ruleId} ${why.join(', ')}`)
    if (!rule.conditionsMet) printConditions(rule.conditions, '    ')
  }
}
```

Output for the trace above:

```text
  SKIP  __rbac__#0 action mismatch
  MATCH __rbac__#1
  SKIP  owner-can-update conditions failed
    all (FAIL):
      [FAIL] resource.attributes.ownerId eq "u-42" (actual: "u-99")
  MATCH deny-foreign-update
```

## Debugging recipes

### The request was denied and I do not know why

Print `trace.summary` first. If it says `no matching rules` for every policy, the subject
holds no role granting the action — check `trace.subject.roles`. If a specific policy
denies, open that policy's `decidingRuleId` and read its rule trace.

### The request was allowed and should not have been

Scan for allowing policies and the rules that carried them:

```ts
for (const policy of trace.policies) {
  if (policy.result !== 'allow') continue
  const allows = policy.rules.filter((r) => r.matched && r.effect === 'allow')
  console.log(policy.policyId, allows.map((r) => r.ruleId))
}
```

A policy with `allow-overrides` and a broad rule is the usual cause. `validatePolicy` flags
the broadest form of this as `BROAD_ALLOW`; see [validation](/duck-iam/advanced/validation).

### My scoped roles are not applied

```ts
const trace = await engine.explain(
  'u-42',
  'manage',
  { type: 'dashboard' },
  undefined,
  'org-1',
)
console.log(trace.subject.roles, trace.subject.scopedRolesApplied)
```

An empty `scopedRolesApplied` means either the adapter holds no scoped assignment for that
subject and scope, or it does not implement `getSubjectScopedRoles()`.

### My condition points at the wrong field

Compare `expected` and `actual` on the failing leaf. An `actual` of `null` almost always
means the dot-path does not resolve: either the root is wrong (only `subject`, `resource`,
`environment` and the `action` / `scope` shorthands resolve) or the attribute name differs.
`validatePolicy` warns about this at authoring time with `UNRESOLVABLE_FIELD`.

## Gotchas

* **`result` on a non-applicable policy is not a verdict.** When `targetMatch` is `false`,
  `result` mirrors the engine's `defaultEffect`. Branch on `targetMatch`.
* **Every policy is traced, so cost scales with the whole policy set**, not with the first
  match. This is deliberate — a trace that stopped early would not show you the rules you
  are trying to debug.
* **`expected` is post-resolution.** A `$`-reference is already resolved in the trace. If
  you need the literal, read the policy, not the trace.
* **Depth 10 is Indeterminate, not false.** A condition tree nested deeper than
  `MAX_TRACE_DEPTH` sets `conditionError` on the rule and makes the whole *policy* vote
  Indeterminate — deny if it holds any deny rule, otherwise the default effect. The rule's
  own `matched: false` is not the story; read `conditionError`.
* **A trace can disagree with a single policy's `result`.** The reserved refusal token
  forces `decision.effect: 'deny'` while leaving the policy traces intact. Check
  `decision.failure === 'input'` before reading a policy's allow as the answer.
* **Duplicate rule ids blur the trace.** `decidingRule` is looked up by id with
  `policy.rules.find`, so with duplicate ids the first match wins. `validatePolicy` emits
  `DUPLICATE_RULE_ID` as a warning for exactly this reason: evaluation still works, but
  the breadcrumb gets ambiguous.
* **`decision.rule` *is* populated.** The deciding rule is threaded from the policy trace
  onto the top-level decision. It is `undefined` only when no rule fired and the default
  effect decided.

## See also

* [Devtools panel](/duck-iam/advanced/devtools) — renders this exact trace as a tree.
* [Validation](/duck-iam/advanced/validation) — catch the config mistakes a trace exposes.
* [Engine modes](/duck-iam/advanced/engine/modes) — why `explain()` is development-only.
* [Evaluation pipeline](/duck-iam/core/evaluation) — the non-tracing path.
* [Utility helpers](/duck-iam/advanced/utilities) — `resolve`, `iamEvaluateOperator`, and the matchers the tracer calls.