A rule's condition tree is a group of leaves and nested groups. `When` gives you three nesting methods - `and()`, `or()`, `not()` - plus `whenAny()` on the rule for a top-level OR. Leaf operators are on [conditions](/duck-iam/core/policies/conditions).

## The three group types

`AccessControl.IConditionGroup` is a union of three shapes. Each builder method emits exactly one of them.

| Builder | Emits | True when |
| --- | --- | --- |
| `when(fn)` (rule) / `buildAll()` | `{ all: [...] }` | Every child is true (AND) |
| `whenAny(fn)` (rule) / `buildAny()` | `{ any: [...] }` | At least one child is true (OR) |
| `and(fn)` | nested `{ all: [...] }` | Every child of the nested group is true |
| `or(fn)` | nested `{ any: [...] }` | At least one child of the nested group is true |
| `not(fn)` | nested `{ none: [...] }` | **No** child is true (NOR) |
| `buildNone()` | `{ none: [...] }` | Same as `not()`, at the top level |

Each of `and()`, `or()`, and `not()` constructs a fresh `When`, runs your callback against it, and pushes the resulting group into the parent as a **single item**. The parent's own conjunction is unaffected: a group is just one more child.

`w.not((n) => n.a().b())` builds `none: [a, b]`, which is true only when **both** `a` and `b` are false - that is, `NOT (a OR b)`, not `NOT a OR NOT b`. Two separate `not()` calls (`w.not(x).not(y)`) are `NOT x AND NOT y`, which for this shape happens to be the same thing. If you want `NOT a OR NOT b`, write `w.or((o) => o.not((n) => n.a()).not((n) => n.b()))`.

```ts
import { when } from '@gentleduck/iam'

when()
  .not((n) => n.attr('status', 'eq', 'banned').attr('status', 'eq', 'suspended'))
  .buildAll()
// {
//   all: [
//     { none: [
//       { field: 'subject.attributes.status', operator: 'eq', value: 'banned' },
//       { field: 'subject.attributes.status', operator: 'eq', value: 'suspended' },
//     ] },
//   ],
// }
```

## Evaluation order and short-circuiting

`evalConditionGroup()` walks children in the order the builder appended them and stops as soon as the answer is known: `all` uses `Array.prototype.every` (stops at the first `false`), `any` uses `some` (stops at the first `true`), and `none` is `!some` (also stops at the first `true`).

Four consequences of the `D`, `A1`/`B1`/`C1`, `U`, and `X` nodes:

* **Key precedence is `all` > `any` > `none`, and extra keys are ignored.** `{ all: [], any: [somethingFalse] }` evaluates the `all` and returns `true`. The validator reports a multi-key group; the evaluator does not.
* **Order is yours to choose.** Put the cheapest and most selective check first. A leaf that resolves a subject attribute costs a cached path split plus a property walk; a `matches` leaf may compile a regex. In an `all` group, a leading `w.role('admin')` skips everything after it for non-admins.
* **A short-circuited branch never throws.** The `matches` operator throws `IamRegexInputTooLargeError` on an input over 2048 characters (see [conditions](/duck-iam/core/policies/conditions#regex-safety-matches)). If an earlier sibling in the same `all` group already returned `false`, the `matches` leaf is never reached and the policy is not dropped: `{ all: [falseLeaf, oversizeMatches] }` returns `false`, while `{ all: [oversizeMatches] }` throws.
* **Only a literally empty object is unconditional.** `{}` returns `true`. A group carrying keys the evaluator does not recognise - a typo'd `all`, a hand-edited store row - throws `IamConditionGroupError('unknown-keys')` naming the keys it saw. Reading it as "no conditions" would turn a conditional allow into an unconditional one; answering `false` would retire a deny just as silently. An array as a group is read structurally: `[]` has no keys and returns `true`, a non-empty array throws with its numeric indices named. `null`, `undefined` and primitives throw a plain `TypeError` (`'all' in undefined` raises before any branch), which is still Indeterminate to every caller - so do not match on the error class.

Groups are pure functions of the request; nothing is memoised between children, so writing the same leaf twice costs twice.

## Composing a real tree

```ts
import { defineRule } from '@gentleduck/iam'

const complexAccess = defineRule('complex-access')
  .allow()
  .on('update')
  .of('post')
  .when((w) =>
    w
      // must not be banned
      .not((n) => n.attr('status', 'eq', 'banned'))
      // AND must satisfy one of these
      .or((o) =>
        o
          .role('admin')
          .and((a) => a.isOwner().resourceAttr('locked', 'neq', true)),
      ),
  )
  .build()
```

Read as: `NOT banned AND (admin OR (owner AND post not locked))`. The exact object `build()` produces:

```json
{
  "all": [
    { "none": [{ "field": "subject.attributes.status", "operator": "eq", "value": "banned" }] },
    {
      "any": [
        { "field": "subject.roles", "operator": "contains", "value": "admin" },
        {
          "all": [
            { "field": "resource.attributes.ownerId", "operator": "eq", "value": "$subject.id" },
            { "field": "resource.attributes.locked", "operator": "neq", "value": true }
          ]
        }
      ]
    }
  ]
}
```

The chain is three groups deep: the `when()` root `all`, then `none` and `any` as siblings under it, then the inner `all`. Leaves never count toward the depth budget - only groups do.

`isOwner()` emitted `resource.attributes.ownerId eq '$subject.id'`; that `$` value is resolved against the request at evaluation time, not at build time. See [`$`-variable references](/duck-iam/core/policies/dollar-variables).

## whenAny() versus a nested or()

`when()` and `whenAny()` set the **root** group kind; `or()` sets a nested one.

```ts
// Root is OR: public post, or admin, or owner.
defineRule('flexible-read')
  .allow()
  .on('read')
  .of('post')
  .whenAny((w) => w.resourceAttr('visibility', 'eq', 'public').role('admin').isOwner())
  .build()
// conditions: { any: [ ... ] }

// Root is AND with one OR branch: in-hours AND (admin OR owner).
defineRule('scoped-update')
  .allow()
  .on('update')
  .of('post')
  .when((w) => w.env('hour', 'gte', 9).or((o) => o.role('admin').isOwner()))
  .build()
// conditions: { all: [ envLeaf, { any: [ ... ] } ] }
```

`when()` and `whenAny()` **accumulate**: a second call wraps the existing group and the new one in `{ all: [previous, next] }`, so the two are ANDed rather than replaced. That costs one level of depth per extra call. When a rule needs both a hard requirement and an alternation, prefer one `when()` with a nested `or()`, as in `scoped-update` - it reads better and stays one level shallower.

## Depth limit

`MAX_CONDITION_DEPTH` is `10`. The evaluator counts the root group as depth `0` and throws `IamConditionGroupError('depth')` as soon as it reaches a group at depth `10` - that is, **the eleventh group in a chain**. It does not answer `false`: a deny rule whose group is too deep would stop denying, and a seeded policy reached `engine.can` exactly that way, allowing a banned subject. Indeterminate makes a deny-bearing policy vote deny.

The validator uses the same constant, the same `>=` comparison, and the same starting depth for a rule's root group, so the two boundaries coincide: a tree the evaluator refuses is a tree `build()` already rejected.

| Groups in the chain | `evalConditionGroup` | `validatePolicy` |
| --- | --- | --- |
| 10 | evaluates | no issues |
| 11 | throws `IamConditionGroupError('depth')` | `LIMIT_EXCEEDED` |
| 12 and deeper | throws | `LIMIT_EXCEEDED` |

The error message is `condition nesting exceeds 10`; the validator's is `Condition nesting exceeds MAX_CONDITION_DEPTH (10)` at `rules[i].conditions...`.

Role permissions start one level lower. `rolesToPolicy` wraps a permission's conditions one group down, so the validator checks them from `IAM_RBAC_CONDITION_DEPTH = 1`; anything evaluating a permission's conditions outside the generated policy has to start there too.

The practical budget with the builder: `when()` is the root group, so you get **nine** further `and()` / `or()` / `not()` levels. That is far more than a readable rule needs. If you are approaching it, split the logic into separate rules and let the [combining algorithm](/duck-iam/core/policies/combining-algorithms) compose them, or into separate policies and let [cross-policy combining](/duck-iam/core/cross-policy) do it.

`IAM_MAX_CONDITION_DEPTH` is exported from `@gentleduck/iam` and `@gentleduck/iam/core` if you want to assert against it.

## Empty condition groups

| Group | Result | Why |
| --- | --- | --- |
| `{ all: [] }` | `true` | `[].every(...)` is vacuously true - zero requirements, all met |
| `{ any: [] }` | `false` | `[].some(...)` is false - no alternative can succeed |
| `{ none: [] }` | `true` | `![].some(...)` - nothing was violated |
| `{}` | `true` | no conditions at all |

These fall out of `every` / `some` directly; there is no special case in the evaluator. The asymmetry is the contract, and the builder relies on it in both directions.

```ts
defineRule('x').allow().build().conditions                    // { all: [] }  - matches unconditionally
defineRule('x').allow().when((w) => w).build().conditions     // { all: [] }  - identical object
defineRule('x').whenAny((w) => w).build().conditions          // { any: [] }  - matches nothing
```

`{ any: [] }` is request-independently false, which is not the same as unconditional. `iamMatchesUnconditionally` - the predicate `indexPolicy` and `compileTable` use to decide whether a rule can be treated as matching without running the evaluator - answers `true` only for `{}`, an empty `all`, and an empty `none`. Skipping the evaluator for an empty `any` would turn a rule that never fires into one that always does. Two fast paths once classified this themselves, both read `{ typo: 1 }` as "no conditions", and every divergence ran prod-allows / dev-denies.

The builder treats the two spellings differently for the same reason. `when((w) => w)` with nothing chained does not count as configuring the rule: an empty `all` is the *broadest* group, so `RuleBuilder.build()` refuses the rule unless something else - `allow()`, `deny()`, `on()`, `of()`, `forScope()` - set its shape. `whenAny((w) => w)` is counted unconditionally, because building an `any` list from a collection that turns out to be empty is a legitimate way to say "nobody".

`whenAny((w) => w)` builds `{ any: [] }`, which no request satisfies. On a `deny` rule that removes the protection; on an `allow` rule it removes the grant. Neither the builder nor the validator objects, because "match nothing" is a legitimate thing to express. Use `when()` (or no condition call at all) for an unconditional rule.

## API reference

```ts
class When<TAction, TResource, TRole, TScope, TContext extends object = DotPath.IDefaultContext, TActiveResource extends string = string> {
  and(fn: (w: When<TAction, TResource, TRole, TScope, TContext, TActiveResource>) => When<TAction, TResource, TRole, TScope, TContext, TActiveResource>): this
  or(fn: (w: When<...>) => When<...>): this
  not(fn: (w: When<...>) => When<...>): this
  buildAll(): { readonly all: ReadonlyArray<AccessControl.ICondition | AccessControl.IConditionGroup> }
  buildAny(): { readonly any: ReadonlyArray<AccessControl.ICondition | AccessControl.IConditionGroup> }
  buildNone(): { readonly none: ReadonlyArray<AccessControl.ICondition | AccessControl.IConditionGroup> }
}
```

The nested builder is a fresh `When` with the same type parameters, so typed paths, `TRole`, and the `TActiveResource` narrowing set by `of()` all survive into the callback.

Group type:

```ts
type AccessControl.IConditionGroup = IConditionAll | IConditionAny | IConditionNone
// { all: ReadonlyArray<ICondition | IConditionGroup> }
// { any: ReadonlyArray<ICondition | IConditionGroup> }
// { none: ReadonlyArray<ICondition | IConditionGroup> }
```

Runtime helpers, exported from `@gentleduck/iam` and `@gentleduck/iam/core`:

| Export | Signature | Use |
| --- | --- | --- |
| `iamEvalConditionGroup` | `(req, group, depth?, caches?) => boolean` | Evaluate a tree outside the engine (tests, tooling) |
| `iamMatchesUnconditionally` | `(group) => boolean` | Ask whether a group is true for every request |
| `iamIsCondition` | `(item) => item is AccessControl.ICondition` | Distinguish a leaf from a group when walking a tree |
| `IAM_MAX_CONDITION_DEPTH` | `10` | Assert generated trees before saving |

Pass `depth` only when you are resuming a walk; the default `0` is correct for a rule's root group.

## Gotchas

* `not()` negates the OR of its children, not each child. Re-read the callout above before writing `not()` with more than one child.
* Nesting cost is real but small: each group is one array iteration plus one recursive call. Depth is bounded at 10, so a worst-case tree is bounded work.
* A second `when()` or `whenAny()` on the same rule ANDs onto the first and adds a level of depth. It does not replace it.
* The rule's own `forScope()` condition is prepended to the root `all` group. With `whenAny()`, `build()` wraps your `any` group inside a new `all` alongside the scope leaf, which adds one level to the tree. See [rules](/duck-iam/core/policies/rules#scopes-with-forscope).
* Nesting only decides whether one rule matches. Whether a matched rule wins is the [combining algorithm](/duck-iam/core/policies/combining-algorithms); whether the policy's verdict survives is [cross-policy combining](/duck-iam/core/cross-policy).

## See also

* [Conditions](/duck-iam/core/policies/conditions) - every leaf operator and its edge semantics
* [Combining algorithms](/duck-iam/core/policies/combining-algorithms) - what happens after rules match
* [`$`-variable references](/duck-iam/core/policies/dollar-variables) - values that resolve from the request
* [Rules](/duck-iam/core/policies/rules) - `when()`, `whenAny()`, and `forScope()` on the rule
* [Layered policy example](/duck-iam/core/policies/example-layered) - nesting used in a working policy set