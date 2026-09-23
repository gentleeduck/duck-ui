A rule fires only when its action pattern, its resource pattern, and its condition group all accept the request. This page documents each gate exactly as `src/core/resolve/resolve.ts`, `src/core/evaluate/evaluate.libs.ts` and `src/core/conditions/*` implement it, including what happens when a field is missing, a value is `NaN`, or an array is empty.

## The three gates

Every rule passes through the same three checks, in order, and the first failure skips the rule.

The action and resource gates are pure string matching (`matchesAction`, `matchesResource`, `matchesResourceHierarchical`). The condition gate is `evalConditionGroup`, which resolves fields against the request and applies an operator per leaf. A rule with no `conditions` key, or with `conditions: {}`, skips the third gate entirely and is treated as unconditional; that is also what lets the indexer put it on the precomputed fast path described in [evaluation](/duck-iam/core/evaluation).

## Action patterns

`matchesAction(pattern, action)` accepts exactly three shapes.

| Pattern      | Matches                                                     | Does not match                              |
| ------------ | ----------------------------------------------------------- | ------------------------------------------- |
| `*`          | any action                                                  | -                                           |
| `read`       | `read` only (exact string equality)                         | `read:all`, `reader`                        |
| `admin:*`    | `admin:` followed by anything, for example `admin:users`    | `administer` (no separator), `admin`        |

A rule lists `actions: string[]`; the rule matches when any entry matches (`ruleApplies` uses `some`). The prefix wildcard is separator-bound: the test `'admin:*' does not match an action that merely starts with the same letters without the separator` in `compiled.combine-invariance.test.ts` pins that.

## Resource patterns

Resources have two matchers. `matchesResource` is used when neither the request's resource type nor the pattern contains a dot; `matchesResourceHierarchical` is used when either does.

| Pattern        | Flat matcher (`matchesResource`)                 | Hierarchical matcher (`matchesResourceHierarchical`) |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `*`            | any resource                                     | any resource                                         |
| `dashboard`    | `dashboard` only                                 | `dashboard` only                                     |
| `dashboard.*`  | `dashboard.` followed by anything                | `dashboard.` followed by anything                    |
| `document:*`   | `document:` followed by anything                 | not supported (exact match only)                     |

The consequence that trips people up: a bare pattern is always an exact match. `dashboard` does **not** match `dashboard.users`; you must write `dashboard.*`. Two tests state this directly: `bare "dashboard" rule does NOT match dashboard.users (require dashboard.*)` and `policy with bare target "dashboard" does NOT apply to "dashboard.users"` in `evaluate.test.ts`. Like actions, `.*` is separator-bound: `org.*` does not match `org-1` (`'org.*' resource wildcard does not match a hyphen-joined lookalike`).

Dots in a resource type do not grant implicit prefix matching. If you want `dashboard` rules to cover every sub-resource, list both `dashboard` and `dashboard.*` in the rule, or use `dashboard.*` alone when the root itself never needs the rule.

Policy targets use the same matchers (`policyTargetsActionResource`), so the rule above applies to `targets.actions` and `targets.resources` too. See [targets](/duck-iam/core/policies/targets) for the target side.

## Condition groups

A condition group is one of three shapes, and groups nest.

```ts
type IConditionGroup =
  | { all: (ICondition | IConditionGroup)[] }   // every entry true
  | { any: (ICondition | IConditionGroup)[] }   // at least one entry true
  | { none: (ICondition | IConditionGroup)[] }  // no entry true
```

`evalConditionGroup(req, group, depth = 0, caches?)` evaluates:

* `all` with `every`, `any` with `some`, `none` with `!some`.
* An empty group (`{}`, no key) returns `true`.
* Nesting deeper than `MAX_CONDITION_DEPTH` (10) returns `false` for the whole subtree. The cap is fail-closed on purpose: a runaway nested group cannot become an allow.
* A leaf is anything with a `field` key (`isCondition`).

## Field resolution

Every leaf `field` is a dot path. `resolve(request, path, caches?)` walks it against the request.

Rules of the walk:

* Allowed roots are `subject`, `resource` and `environment` (`ALLOWED_ROOTS`). `action` and `scope` are shorthands that return the request's action and scope; a missing scope resolves to `null`.
* Any other root resolves to `null`.
* A missing segment anywhere resolves to `null`. There is no distinction between "key absent" and "value null".
* **Own properties only.** The walk is `Object.hasOwn(node, seg) ? Reflect.get(node, seg) : undefined`. `Reflect.get` alone resolves through the prototype chain, so `toString`, `valueOf`, `hasOwnProperty` and every other `Object.prototype` member resolved to a *function* on any object - and an `exists`-gated allow fired against a subject with no attributes at all. `exists` asks whether the request *carries* the attribute, which is an own-property question. A subject attribute literally named `toString` still resolves; the rule is about ownership, not about the name.
* **The resolved value is narrowed, not asserted.** `isAttributeValue` accepts scalars, arrays of scalars, and plain (or null-prototype) objects whose values are all scalars. A `Date`, a `Map`, a class instance, a function, a doubly-nested object or a mixed array all resolve to `null`. Adapters deserialize JSON and hand the result straight through, so these genuinely arrive; asserting the type left each operator's own `typeof` guard as the only thing between a non-conforming value and a wrong comparison, and a `false` from a deny rule's condition is a silent grant. The walk still *descends* through a nested object even though the object itself is not a value, so `subject.attributes.nested.deep` resolves.
* Segments named `__proto__`, `constructor` or `prototype` are blocked (`BLOCKED_SEGMENTS`) and resolve to `null`, which closes the prototype-pollution route through attacker-controlled attribute keys. `BLOCKED_SEGMENTS` is exported for one consumer: `isResolvablePath` in the validator, which must refuse what the resolver refuses. It shared only `ALLOWED_ROOTS`, so `subject.__proto__.x` passed validation and then resolved to `null` - the inert condition the validator exists to catch, and on a `deny` rule a rule that can never fire.
* Parsed paths are cached in a FIFO map capped at `PATH_CACHE_MAX` (10,000) entries, and rejections are **negative-cached** (`null` under the path) so a blocked path is refused once at parse time rather than walked per request. Pass a per-Engine map to keep tenants from evicting each other; `clearPathCache()` empties only the process-wide map. The map itself and `ALLOWED_ROOTS` are deliberately not re-exported - handing out the mutable `Map` lets a consumer seat a bogus segment list under a path a deny rule resolves, and `ALLOWED_ROOTS` is typed `ReadonlySet` but erases to a live `Set`, so `.delete('subject')` would make every `subject.*` path unresolvable and the cache would memoize that.

Typical fields: `subject.id`, `subject.roles`, `subject.scopedRoles`, `subject.attributes.department`, `resource.attributes.ownerId`, `environment.now`, `environment.ip`.

## Value references

A leaf `value` that is a string beginning with `$` is resolved against the request instead of being used literally (`resolveValue`). `$subject.id` becomes the requesting subject's id at evaluation time, which is how ownership rules are written without a per-user policy.

```ts
import { definePolicy } from '@gentleduck/iam/core'

export const documents = definePolicy('documents')
  .name('Documents')
  .algorithm('deny-overrides')
  .rule('owner-can-edit', (r) =>
    r
      .allow()
      .on('update', 'delete')
      .of('document')
      .when((w) => w.check('resource.attributes.ownerId', 'eq', '$subject.id')),
  )
  .build()
```

This ownership check is common enough to have a shorthand. `w.isOwner()` expands to exactly the condition above, and takes an optional field path when the owner is stored somewhere other than `resource.attributes.ownerId`.

Two guards apply. A `$`-reference that does not resolve yields `null`, so `eq` against a missing field is simply false unless the other side is also `null`. And the `matches` operator refuses a `$`-sourced pattern outright (`isUserSourcedValue`): a request must never be able to supply the regex.

## Operator reference

The value passed to an operator is `cond.value ?? null` after `$`-resolution; the field is the resolved value or `null`. `typeof` checks are strict, so there is no string-to-number coercion anywhere.

| Operator       | Field type          | Value type      | True when                                                                 | Missing field (`null`)              | Other edge cases                                                                       |
| -------------- | ------------------- | --------------- | ------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `eq`           | any                 | any             | `field === value`                                                         | true only if `value` is `null`      | no deep equality: arrays and objects compare by reference, so effectively never equal  |
| `neq`          | any                 | any             | `field !== value`                                                         | true unless `value` is `null`       | same reference semantics as `eq`                                                       |
| `gt` `gte` `lt` `lte` | number       | number          | numeric comparison                                                        | false                               | either side not a number: false; `NaN` on either side: false                          |
| `in`           | scalar or scalar\[]  | array           | scalar field is in list; array field shares at least one scalar with list | `[..., null]` matches, else false   | value not an array: false; object field: false                                         |
| `nin`          | scalar or scalar\[]  | array           | negation of `in`                                                          | true unless list contains `null`    | value not an array: **true**; object field: true                                       |
| `contains`     | array or string     | scalar / string | array includes scalar value, or string includes substring                 | false                               | array field with non-scalar value: false; number field: false                          |
| `not_contains` | array or string     | scalar / string | negation of `contains`                                                    | **true**                            | any shape `contains` cannot handle returns true                                        |
| `starts_with`  | string              | string          | `field.startsWith(value)`                                                 | false                               | non-string on either side: false; empty value: true for any string field               |
| `ends_with`    | string              | string          | `field.endsWith(value)`                                                   | false                               | same as `starts_with`                                                                  |
| `matches`      | string              | string          | regex test                                                                | false                               | see the ReDoS section below                                                            |
| `exists`       | any                 | ignored         | field is not `null` and not `undefined`                                   | false                               | `0`, `''`, `false` and `[]` all exist                                                  |
| `not_exists`   | any                 | ignored         | field is `null` or `undefined`                                            | true                                |                                                                                        |
| `subset_of`    | array               | array           | every field item is in value                                              | false                               | `[]` is a subset of anything; non-array on either side: false                          |
| `superset_of`  | array               | array           | every value item is in field                                              | false                               | any array is a superset of `[]`; non-array on either side: false                       |
| `after`        | number or ISO string| number or string| `toEpoch(field) > toEpoch(value)`                                         | false                               | unparsable string, `NaN`, boolean or array on either side: false                       |
| `before`       | number or ISO string| number or string| `toEpoch(field) < toEpoch(value)`                                         | false                               | same as `after`                                                                        |

`toEpoch` passes numbers through unchanged and runs `Date.parse` on strings, so `environment.now` (a millisecond epoch injected by the engine) compares correctly with an ISO string value. Both sides must be finite; an `Infinity` or `NaN` epoch is a false, not an error.

`nin` and `not_contains` return `true` whenever the shapes do not line up (non-array value, object field, missing field). Never gate an allow rule on a negative operator alone; pair it with `exists` in the same `all` group so a missing attribute cannot satisfy the rule.

### `matches` and ReDoS protection

`matches` is the only operator that can throw, and it is also the only one with a pattern budget.

* Field or value not a string: `false`.
* Pattern longer than `MAX_REGEX_LENGTH` (128): `false`.
* Pattern that fails to compile, or that contains a nested quantifier such as `(a+)+` (`NESTED_QUANTIFIER_RE`): `false`. Invalid patterns are cached as `null` so they are not recompiled per request.
* Input longer than `MAX_REGEX_INPUT_LENGTH` (2048): throws `RegexInputTooLargeError` (`name: 'RegexInputTooLargeError'`, `tag: 'duck-iam/regex-input-too-large'`, `field`, `length`). `evalCondition` rethrows it with the offending field name; the evaluator catches it per policy, skips that policy, and reports through `onPolicyError`. Throwing rather than returning `false` is deliberate: a `deny` rule guarded by `matches` must not flip to allow on oversized input.
* A `$`-sourced pattern is refused before anything else runs.

Compiled patterns live in an LRU of `REGEX_CACHE_MAX` (256) entries. Each engine instance owns its own regex cache (`iamCreateEvalCaches()`), and the process-wide one is cleared by `iamFlushSharedCaches()` from `@gentleduck/iam/core/engine`. (The underlying `clearRegexCache` is internal; `core/conditions` does not re-export it.)

## When a rule does not fire

Work through the gates in order when a rule you expect to match is silent:

1. Action: is the request action exactly one of `rule.actions`, or covered by a `prefix:*` entry?
2. Resource: is `request.resource.type` exactly one of `rule.resources`, or covered by `prefix.*` (or `prefix:*` when no dots are involved)? Remember a bare pattern is exact.
3. Policy target: did the policy's `targets` accept the action, resource and subject roles at all? A policy whose targets do not match is not applicable and its rules are never consulted.
4. Conditions: run `engine.explain()` in `development` mode. The trace lists every policy and every rule with the reason it was or was not applied, including operator results.

## Gotchas

* `eq` on a missing field against a `null` value is true. If you mean "attribute present and equal", add `exists`.
* `in` with a non-array value is always false, even when the field equals the value. Use `eq` for a single value.
* The hierarchical matcher is chosen when the request's resource **type** contains a dot, not the id. `resource.id` never participates in matching; use `resource.attributes` conditions to constrain ids.
* `environment.now` is injected only when the caller did not supply it, so a rule that reads `environment.now` behaves deterministically in tests when you pass a fixed value.

## See also

* [Evaluation](/duck-iam/core/evaluation) - the pipeline that runs these gates for every applicable policy.
* [Cross-policy semantics](/duck-iam/core/cross-policy) - how per-policy outcomes are combined.
* [Rules](/duck-iam/core/policies/rules) and [targets](/duck-iam/core/policies/targets) - authoring the patterns this page matches.
* [Conditions](/duck-iam/core/policies/conditions) - the builder API for condition groups.