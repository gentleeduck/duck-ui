Three namespaces hold the whole core type system. `IamPrimitives` holds the scalar and attribute types every value bottoms out in. `IamRequest` holds the request side - who is asking, about what, in which context. `AccessControl` holds the policy side and the result. This page lists every member of the three, with the exact name you import and the exact fields the source declares.

```ts
import type { AccessControl, IamPrimitives, IamRequest } from '@gentleduck/iam'
```

## The type map

The request side and the policy side meet only at evaluation time; nothing on one side references the other.

`IDecision` is the only type that reaches across: it carries the winning `IRule` and the id of the policy it came from.

## Attribute values

Every user-supplied value in duck-iam - subject attributes, resource attributes, environment fields, rule and role metadata, and the right-hand side of a condition - is an `IamPrimitives.AttributeValue`.

```ts
namespace IamPrimitives {
  type Scalar = string | number | boolean | null
  type AttributeValue = Scalar | Scalar[] | Record<string, Scalar>
  type Attributes = Record<string, AttributeValue>
}
```

There are five attribute bags in the system, and a condition reaches each through a different dot-path root.

The first four bags are reachable from a condition `field`; `metadata` is not - it exists for admin dashboards, audit logs, and your own bookkeeping. Field resolution rules (allowed roots, blocked segments, missing values) are documented on [rule matching](/duck-iam/core/rule-matching).

`engine.admin.setAttributes()` rejects a bag with more than 256 own keys or a nesting depth above 16, and rejects anything that is not a plain object. The cap exists because an unbounded bag bloats the adapter row and every subsequent field resolution.

## Request side

### `IamRequest.ISubject`

Who is asking. The engine builds this for you from a `subjectId`; you rarely construct one by hand.

```ts
interface ISubject<TRole extends string = string, TScope extends string = string> {
  readonly id: string
  readonly roles: readonly TRole[]
  readonly scopedRoles?: readonly IScopedRole<TRole, TScope>[]
  readonly attributes: Readonly<IamPrimitives.Attributes>
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Unique identifier: user id, service account id. Capped at 1024 characters by the engine entry points. |
| `roles` | `readonly TRole[]` | Effective roles - assigned roles already closed over `inherits`. Not the raw assignment list. |
| `scopedRoles` | `readonly IScopedRole[]` | Optional. Scoped assignments, also closed over `inherits`. `undefined` when the adapter has no `getSubjectScopedRoles`. |
| `attributes` | `Readonly<Attributes>` | Whatever the adapter stores for this subject. Reachable as `subject.attributes.*`. |

`engine.authorize()` replaces a non-array `roles` with `[]` before evaluating. A bare string would substring-match the `contains` condition that `rolesToPolicy` generates, so `'administrator'` would satisfy a check for the role `'admin'`. The normalisation closes that; do not defeat it by bypassing `authorize()`.

### `IamRequest.IScopedRole`

One role assignment restricted to a tenant, organisation, or workspace.

```ts
interface IScopedRole<TRole extends string = string, TScope extends string = string> {
  readonly role: TRole
  readonly scope?: TScope
  readonly attributes?: IamPrimitives.Attributes
}
```

`attributes` here describe the grant, not the subject: a region or department attached to this one assignment. They are distinct from `ISubject.attributes` and are `undefined` when the adapter carries none.

### `IamRequest.IResource`

```ts
interface IResource<TResource extends string = string> {
  readonly type: TResource
  readonly id?: string
  readonly attributes: Readonly<IamPrimitives.Attributes>
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | `TResource` | The kind of thing, e.g. `'post'`, `'dashboard.users'`. This is the only field pattern matching looks at. |
| `id` | `string` (optional) | The specific instance. Never participates in matching; constrain it with a condition on `resource.id` if you need to. |
| `attributes` | `Readonly<Attributes>` | Record-level data: `ownerId`, `status`, `tenantId`, tags. This is what makes ownership and status rules possible. |

Dotted resource types form a hierarchy, but the hierarchy is opt-in per pattern: a rule for `dashboard` does not cover `dashboard.users` unless it is written `dashboard.*`. See [rule matching](/duck-iam/core/rule-matching) for the two matchers.

### `IamRequest.IEnvironment`

```ts
interface IEnvironment {
  readonly ip?: string
  readonly userAgent?: string
  readonly timestamp?: number
  readonly now?: number
  readonly [key: string]: IamPrimitives.AttributeValue | undefined
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `ip` | `string` | Client IP. The server integrations normalise forwarded headers into this. |
| `userAgent` | `string` | Client user agent. |
| `timestamp` | `number` | Request timestamp in epoch milliseconds, set by the caller. |
| `now` | `number` | Evaluation clock in epoch milliseconds. Injected by the engine as `Date.now()` when absent. |
| any other key | `AttributeValue` | Custom context: `region`, `hour`, `maintenanceMode`, feature flags. |

The engine calls `ensureEnvNow()` after `beforeEvaluate` runs, so a hook or a test that pins `environment.now` keeps its value and a normal request still gets a real clock. Temporal operators (`before`, `after`) and `$environment.now` references depend on it. `timestamp` is untouched by the engine - it is yours to set.

### `IamRequest.IAccessRequest`

```ts
interface IAccessRequest<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
> {
  readonly subject: ISubject
  readonly action: TAction
  readonly resource: IResource<TResource>
  readonly scope?: TScope
  readonly environment?: IEnvironment
}
```

`engine.can()`, `engine.check()` and `engine.permissions()` assemble this from a `subjectId` plus the parts you pass. `engine.authorize()` takes a pre-built request, which is the entry point to use when you already hold a resolved subject.

### Action and scope

Neither is an interface. An action is any `string`; the CRUD verbs are convention, not built in. Wildcards are a property of the *pattern* in a rule (`'*'`, `'posts:*'`), never of the action on the request.

A scope is any `string`: an org id, a workspace slug, a project key. It appears in four places - `IAccessRequest.scope`, `IScopedRole.scope`, `IRole.scope`, and `IPermission.scope` - and only the first is set per request. The exported helper `matchesScope(pattern, scope)` implements the comparison: an absent or `'*'` pattern matches anything, a request with no scope matches only those global patterns, and otherwise the match is exact.

Scope is the one request field that changes which roles a subject holds, through scoped-role enrichment. See [evaluation](/duck-iam/core/evaluation) for the enrichment step and [scoped roles](/duck-iam/core/roles/scoped) for the three ways to attach a scope.

## Policy side

### `AccessControl.Effect` and `AccessControl.Operator`

```ts
type Effect = 'allow' | 'deny'

type Operator =
  | 'eq' | 'neq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'matches'
  | 'exists' | 'not_exists'
  | 'subset_of' | 'superset_of'
  | 'before' | 'after'
```

Nineteen operators. Their exact semantics for missing fields, `NaN`, and empty arrays are tabulated on [rule matching](/duck-iam/core/rule-matching).

### `AccessControl.ICondition` and the condition group arms

```ts
interface ICondition {
  readonly field: string
  readonly operator: Operator
  readonly value?: IamPrimitives.AttributeValue
}

interface IConditionAll  { readonly all:  ReadonlyArray<ICondition | IConditionGroup> }
interface IConditionAny  { readonly any:  ReadonlyArray<ICondition | IConditionGroup> }
interface IConditionNone { readonly none: ReadonlyArray<ICondition | IConditionGroup> }

type IConditionGroup = IConditionAll | IConditionAny | IConditionNone
```

The three arms are named interfaces rather than anonymous object literals on purpose: a schema generator that walks anonymous arms inlines the recursive tree into itself until the stack goes. Exactly one key must be present. Groups nest, and nesting deeper than `MAX_CONDITION_DEPTH` (10) evaluates to `false` for the whole subtree.

### `AccessControl.IRule`

```ts
interface IRule<TAction extends string = string, TResource extends string = string> {
  readonly id: string
  readonly effect: Effect
  readonly description?: string
  readonly priority: number
  readonly actions: readonly (TAction | '*')[]
  readonly resources: readonly (TResource | '*')[]
  readonly conditions: IConditionGroup
  readonly metadata?: Readonly<IamPrimitives.Attributes>
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Rule identifier. Appears in `IDecision.reason` and in explain traces. |
| `effect` | `Effect` | `'allow'` or `'deny'`. |
| `description` | `string` (optional) | Human-readable text for audit logs and explain output. |
| `priority` | `number` | Higher wins under `first-match` and `highest-priority`. A missing or non-finite value ranks as `0`. |
| `actions` | `readonly string[]` | Action patterns. Any entry matching is enough. |
| `resources` | `readonly string[]` | Resource patterns. Any entry matching is enough. |
| `conditions` | `IConditionGroup` | The condition tree. An empty object is treated as unconditional. |
| `metadata` | `Attributes` (optional) | Arbitrary bookkeeping. Not readable by conditions. |

### `AccessControl.CombiningAlgorithm`

How rules *inside one policy* are folded into a single effect.

```ts
type CombiningAlgorithm = 'deny-overrides' | 'allow-overrides' | 'first-match' | 'highest-priority'
```

| Algorithm | Behaviour |
| --- | --- |
| `deny-overrides` | Any matched deny wins; otherwise the first matched allow wins. |
| `allow-overrides` | Any matched allow wins; otherwise the first matched deny wins. Used by the generated `__rbac__` policy. |
| `first-match` | The highest-priority matched rule wins; ties keep source order. |
| `highest-priority` | Identical to `first-match`: same ranking, same source-order tie-break. Only the `reason` string differs. |

Source order is `policy.rules` order, which for a stored policy is the adapter's row order, so two equal-priority rules of opposing effect make the verdict depend on it. Full decision diagrams live on [combining algorithms](/duck-iam/core/policies/combining-algorithms).

### `AccessControl.PolicyCombine`

How verdicts from *different policies* are merged. Configured once per engine as `policyCombine`.

```ts
type PolicyCombine = 'and' | 'allow-overrides' | 'first-applicable'
```

See [cross-policy combination](/duck-iam/core/cross-policy) for the semantics of each and for what "applicable" means.

### `AccessControl.IPolicy`

```ts
interface IPolicy<
  TAction extends string = string,
  TResource extends string = string,
  TRole extends string = string,
> {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly version?: number
  readonly algorithm: CombiningAlgorithm
  readonly rules: readonly IRule<TAction, TResource>[]
  readonly targets?: {
    readonly actions?: readonly (TAction | '*')[]
    readonly resources?: readonly (TResource | '*')[]
    readonly roles?: readonly TRole[]
  }
}
```

`targets` is a coarse gate on the whole policy. Each declared dimension must match or the policy is NotApplicable and contributes nothing. `targets.roles` is an exact membership test against `subject.roles` - not a pattern match.

### `AccessControl.IPermission` and `AccessControl.IRole`

```ts
interface IPermission<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
> {
  readonly action: TAction | '*'
  readonly resource: TResource | '*'
  readonly scope?: TScope | '*'
  readonly conditions?: IConditionGroup
}

interface IRole<
  TAction extends string = string,
  TResource extends string = string,
  TId extends string = string,
  TScope extends string = string,
> {
  readonly id: TId
  readonly name: string
  readonly description?: string
  readonly permissions: readonly IPermission<TAction, TResource, TScope>[]
  readonly inherits?: readonly string[]
  readonly scope?: TScope
  readonly metadata?: Readonly<IamPrimitives.Attributes>
}
```

A permission's `scope` overrides the scope of the role that **declared** it, not of the role that inherited it. Only `undefined` and `'*'` are global and add no condition at all; every other string is an ordinary scope value, `''` included. Note the type asymmetry: `IPermission.scope` is `TScope | '*'` while `IRole.scope` is `TScope`, though both read `'*'` as global at runtime.

`inherits` is resolved recursively, bounded by `MAX_INHERITANCE_DEPTH` (32). Cycles are cut by a shallowest-depth memo rather than a visited set, and the bound is on traversal, not on the grant. See [role inheritance](/duck-iam/core/roles/inheritance).

## Result side

### `AccessControl.IDecision`

The complete field list. Nothing else is on this object.

```ts
interface IDecision {
  readonly allowed: boolean
  readonly effect: Effect
  readonly rule?: IRule
  readonly policy?: string
  readonly reason: string
  readonly duration: number
  readonly timestamp: number
  readonly applicable?: boolean
}
```

| Field | Type | Always present | Meaning |
| --- | --- | --- | --- |
| `allowed` | `boolean` | yes | The verdict. Equivalent to `effect === 'allow'`. |
| `effect` | `Effect` | yes | The winning effect. |
| `rule` | `IRule` | no | The rule that decided. Absent when the decision came from `defaultEffect`, from a NotApplicable policy, or from the no-policies path. |
| `policy` | `string` | no | The id of the policy that produced the decision. Absent on the no-policies path, on the all-NotApplicable fallback, and on a synthesised policy-error decision. |
| `reason` | `string` | yes | Human-readable explanation, e.g. `Denied by rule "block-banned"`. |
| `duration` | `number` | yes | Evaluation time in milliseconds, from `performance.now()`. |
| `timestamp` | `number` | yes | `Date.now()` at the moment the decision was made. |
| `applicable` | `boolean` | no | `false` marks a NotApplicable per-policy decision. Omitted (never `true`) for applicable ones. |

`evaluatePolicy()` still fills `allowed` on a NotApplicable result, from `defaultEffect`, so the object stays a well-formed `IDecision`. It is not a verdict. Check `applicable === false` first. The cross-policy combiner does exactly that and skips such decisions; if you call `evaluatePolicy()` yourself, you must too.

### `AccessControl.Mode` and the mode-conditional types

```ts
type Mode = 'development' | 'production'

type ModeResult<M extends Mode> = M extends 'production' ? boolean : IDecision

type ModePermissionMap<
  M extends Mode,
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
> = M extends 'production' ? Record<string, boolean> : IamClient.PermissionMap<TAction, TResource, TScope>
```

`ModeResult` is what `engine.authorize()` and `engine.check()` return; `ModePermissionMap` is what `engine.permissions()` returns. `engine.can()` returns a plain `boolean` in both modes.

### `AccessControl.OpFn`

```ts
type OpFn = (field: IamPrimitives.AttributeValue, value: IamPrimitives.AttributeValue) => boolean
```

The signature every operator implementation satisfies. Exposed so custom tooling can type an operator table.

## API reference

Every type on this page, in one list. All are re-exported from `@gentleduck/iam` and `@gentleduck/iam/core`.

| Namespace | Members |
| --- | --- |
| `IamPrimitives` | `Scalar`, `AttributeValue`, `Attributes` |
| `IamRequest` | `IScopedRole`, `ISubject`, `IResource`, `IEnvironment`, `IAccessRequest` |
| `AccessControl` | `Effect`, `Operator`, `ICondition`, `IConditionAll`, `IConditionAny`, `IConditionNone`, `IConditionGroup`, `IRule`, `CombiningAlgorithm`, `PolicyCombine`, `IPolicy`, `IPermission`, `IRole`, `IDecision`, `Mode`, `ModeResult`, `ModePermissionMap`, `OpFn` |

The generic parameters (`TAction`, `TResource`, `TRole`, `TScope`) all default to `string`. Supplying literal unions is what makes the builder and the `$`-path helpers type-safe; see [type-safe roles](/duck-iam/core/roles/type-safe) and [typed context](/duck-iam/advanced/config/context).

## Gotchas

* `ISubject.roles` is the *effective* set, not the assignment list. Inheritance has already been applied by the time you see it, so a policy targeting a parent role matches a subject who only holds the child.
* `IResource.id` is inert for matching. Only `type` is pattern-matched.
* `IRule.conditions` is required by the type, but rows loaded through an adapter can arrive without it. The evaluator narrows before reading, and a rule with no condition key is unconditional.
* `IDecision.applicable` is never `true`. It is either `false` or absent.
* `IEnvironment` has a string index signature typed `AttributeValue | undefined`, so a custom key can hold an array or a flat record - but not a nested object tree.

## See also

* [Rule matching](/duck-iam/core/rule-matching) - how `actions`, `resources`, and `conditions` are actually compared.
* [Evaluation pipeline](/duck-iam/core/evaluation) - where each of these objects is built and consumed.
* [Cross-policy combination](/duck-iam/core/cross-policy) - what `applicable` means to the combiner.
* [Type map](/duck-iam/types) - the complete namespace inventory, including the adapter, client, and cache namespaces.