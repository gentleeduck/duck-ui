A condition value that starts with `$` is not a literal. At evaluation time the engine strips the `$` and resolves the rest as a dot-path against the current request, so a rule can compare one field to another instead of to a constant. With a typed `context`, those references autocomplete. This page covers the type that produces them, the runtime that consumes them, and the three places where the two do not line up.

## The type

```ts
export type DollarPaths<TContext> = `$${DotPaths<TContext>}`

export type FlexibleDollarPaths<TContext> = DollarPaths<TContext> | (string & {})
```

`DollarPaths` prefixes every member of `DotPath.DotPaths

`resolveValue` is the whole mechanism: if the value is a string that starts with `` cannot be expressed - it will always be treated as a reference.

## What resolve() will and will not reach

`$`-references go through the same resolver as field paths, which is deliberately narrow.

Three consequences follow from that diagram:

* **Only five roots exist.** `subject`, `resource`, and `environment` are the object roots; `action` and `scope` are shorthands handled before the root check. `request.headers` resolve to `null`.
* **Prototype segments are refused, twice over.** The walk reads **own properties only**, so nothing on the prototype chain is reachable at all; on top of that `__proto__`, `constructor` and `prototype` are rejected at parse time so the path is refused once and memoised as invalid rather than walked per request. Own-property reads also fixed a subtler bug: every `Object.prototype` member resolved to a function on any object, so an `exists`-gated allow fired against a subject with no attributes.
* **A miss is `null`, not an error.** A typo in a `$`-path makes the comparison run against `null`, which for `eq` and `neq` is a silent wrong answer rather than a failure. This is exactly the class of bug a typed context prevents.
* **A value outside the attribute contract also resolves to `null`.** `resolve` narrows what it found rather than asserting it: scalars, arrays of scalars, and plain objects whose values are scalars pass; a `Date`, a nested object, or a function does not. Adapters deserialise JSON and hand the result straight through, so those genuinely reach here, and `null` is NotApplicable rather than a guess.

`$environment.now` is always available: the engine calls `ensureEnvNow(req)` after `beforeEvaluate`, defaulting `environment.now` to `Date.now()` when a hook has not pinned one. Pair it with `before` / `after` for "is this grant still valid" rules.

## Where `$`-references are accepted

The value parameter of a builder method is typed `... | DotPath.FlexibleDollarPaths` resolved at runtime | Notes |
|---|---|---|---|
| `check(field, op, value)` | yes | yes | The general escape hatch; any operator, any path |
| `eq(field, value)` | yes | yes | |
| `neq(field, value)` | yes | yes | |
| `attr(key, op, value)` | yes | yes | Key is a subject-attribute path |
| `resourceAttr(key, op, value)` | yes | yes | Key narrows per `.of()` |
| `env(key, op, value)` | yes | yes | Key is an environment path |
| `contains(field, value)` | no - `value: string` | yes | A `$`-string compiles as a plain string and resolves normally |
| `matches(field, regex)` | no - `regex: string` | **refused** | See the security note below |
| `gt` / `gte` / `lt` / `lte` | no - `value: number` | n/a | Use `check(field, 'gt', '$path')` for a dynamic bound |
| `in(field, values)` | element type allows `$` | **no** | See the gotcha below |
| `exists` / `not_exists` | no value parameter | n/a | |
| `role` / `roles` / `scope` / `scopes` | no - constrained to `TRole` / `TScope` | n/a | These emit fixed field paths |
| `isOwner(ownerField?)` | argument is the *field*, not the value | yes | Always emits `value: '$subject.id'` |

`evalCondition` short-circuits to `false` whenever the operator is `matches` and the value is a `` pattern were resolved, anyone who could write a subject, resource, or environment attribute could plant a catastrophic regex and stall the evaluation thread. The refusal is unconditional - it does not matter where the attribute came from. Regex patterns must be literals in the policy, and they are additionally capped at `MAX_REGEX_LENGTH` (128 characters) with the subject string capped at 2048.

`in(field, values)` types its array elements as `FieldValue | FlexibleDollarPaths`, so `w.in('subject.attributes.tier', ['resource.attributes.tier`. Use `check(field, 'eq', '$path')` for a dynamic single value, or keep `in` arrays literal.

## Common patterns

### Ownership

```ts
.when((w) => w.resourceAttr('ownerId', 'eq', '$subject.id'))
```

`w.isOwner()` is the shorthand and emits exactly `{ field: 'resource.attributes.ownerId', operator: 'eq', value: '$subject.id' }`. Pass a different field to `isOwner('resource.attributes.createdBy')` when your column is named otherwise.

### Cross-field equality

```ts
.when((w) => w.attr('department', 'eq', '$resource.attributes.department'))
```

The subject's department must match the resource's.

### Self-action prevention

```ts
.rule('no-self-delete', (r) =>
  r.deny().on('delete').of('user').when((w) => w.check('resource.id', 'eq', '$subject.id')),
)
```

### Scope match

```ts
.when((w) => w.check('resource.attributes.scope', 'eq', '$scope'))
```

`$scope` uses the shorthand root, so it reads `request.scope` and yields `null` when the request carried no scope.

### Temporal validity

```ts
.when((w) => w.check('subject.attributes.suspendedUntil', 'after', '$environment.now'))
```

Both operands are coerced to epoch milliseconds - numbers pass through, ISO-8601 strings are parsed, and anything else becomes `NaN` so the comparison fails closed.

## Gotchas

* **A `$`-path that does not exist resolves to `null`, silently.** `eq` against `null` is `false`; `neq` against `null` is `true`. A typo in a `deny` rule's `$`-path can therefore turn the rule permanently on. Typed contexts are the defence.
* **The type system does not cross-validate the two sides.** `check('resource.attributes.tier', 'eq', '$subject.attributes.status')` compiles even when the two resolve to disjoint unions, because the value type is a union of the field's type *and* every `$`-path. Treat `$`-references as unchecked on the value side.
* **`check()` is the widest door.** Its field parameter is `FlexibleDotPaths`, so with an open bag anywhere in your context it accepts any string on both sides. That is what makes it useful for paths you never typed, and what makes it the least protected method.

## See also

* [Typed context](/duck-iam/advanced/config/context) - where `DotPaths` (and therefore `DollarPaths`) comes from.
* [$-variables](/duck-iam/core/policies/dollar-variables) - the untyped view of the same feature.
* [Conditions](/duck-iam/core/policies/conditions) - operator-by-operator semantics.
* [Methods reference](/duck-iam/advanced/config/methods) - the builders these values are passed to.