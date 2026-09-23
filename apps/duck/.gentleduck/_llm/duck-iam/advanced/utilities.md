The engine is built from small pure functions, and most of them are exported. Reach for them
when you need matching or resolution without a full engine call: a routing guard, a unit
test that pins matching logic in isolation, middleware that resolves request attributes
before evaluation, or a hand-rolled pipeline.

## Import surface

| Helper group | Import from | Naming |
|---|---|---|
| Matchers, `resolve`, path-cache controls | `@gentleduck/iam` or `@gentleduck/iam/core` | unprefixed |
| Condition primitives | `@gentleduck/iam` or `@gentleduck/iam/core` | **`iam` / `IAM_` prefixed** |
| `iamEscapeHtml` | `@gentleduck/iam`, `@gentleduck/iam/core`, or `@gentleduck/iam/core/explain` | prefixed |
| `IamLRUCache`, key helpers | `@gentleduck/iam` (root only — not in `/core`) | prefixed |
| Row parsers | `@gentleduck/iam/core/validate` only | unprefixed |

```ts
import {
  matchesAction,
  matchesResource,
  matchesResourceHierarchical,
  matchesScope,
  resolve,
  iamEvaluateOperator,
  iamResolveConditionValue,
} from '@gentleduck/iam'
```

`core/conditions` exports its internals under short names — `evalCondition`, `resolveValue`,
`isCondition` — but the barrel renames every one of them before it reaches the package
root, because those are names a consumer's own code plausibly uses. The prefix is the house
convention for exactly that collision.

So the resolve-layer names (`resolve`, `matchesAction`, `clearPathCache`, `PATH_CACHE_MAX`)
are what you import, while every condition-layer name gains `iam` or `IAM_`:
`iamEvalCondition`, `iamEvalConditionGroup`, `iamEvaluateOperator`, `iamResolveValue`,
`iamResolveConditionValue`, `iamIsCondition`, `iamIsUserSourcedValue`, `iamGetCachedRegex`,
`iamClearRegexCache`, `iamDetectCatastrophicRegex`, `iamMatchesUnconditionally`,
`IAM_MAX_CONDITION_DEPTH`, `IAM_MAX_REGEX_LENGTH`, `IAM_MAX_REGEX_INPUT_LENGTH`,
`IAM_REGEX_CACHE_MAX`, `IAM_MAX_BOUNDED_QUANTIFIER`, `IAM_MAX_UNBOUNDED_QUANTIFIERS`.
Importing the short name from the package root does not resolve.

The root entry is `export * from './core'` plus five shared-module exports, so anything in
`/core` is also at the root. The reverse is not true: `IamLRUCache`, `iamLRUCache`,
`iamBuildPermissionKey`, `iamParsePermissionKey`, and `iamSplitPermissionKey` live in
`src/shared` and are exported only from the root.

### What is deliberately not exported

Four module globals stay internal, and the reason is the same in each case: they are
mutable, process-wide, and shared by every engine in the process, so handing a consumer the
reference is handing them the ability to retire a deny rule.

| Withheld | What a consumer could do with it | Use instead |
|---|---|---|
| `ops` | `ops.eq = () => false` retires every `eq` deny rule, in both evaluation modes | `iamEvaluateOperator` |
| `regexCache` | Seat a permissive `RegExp` under a pattern a deny rule relies on | `iamClearRegexCache()` |
| `pathCache` | Seat a bogus segment list under a path a deny rule resolves | `clearPathCache()` |
| `ALLOWED_ROOTS` | Typed `ReadonlySet`, erases to a live `Set` — `.delete('subject')` makes every `subject.*` path unresolvable, and `pathCache` memoises that so it sticks | — |

Neither is frozen at runtime, so withholding them from the barrel is the only thing keeping
them internal. The raw `evaluatePolicy` / `evaluatePolicyFast` are withheld for a different
reason: they carry no `allowFailOpen` gate. `iamEvaluatePolicy` and `iamEvaluatePolicyFast`
are the gated public names.

## Where they sit in evaluation

The matchers and the resolver are the two halves of one rule check; the condition
primitives sit under them.

`matchesScope` is the one that is not part of rule matching: it gates whether an RBAC
permission applies in a given tenant scope. The dot test in the middle is exactly what
`traceRule` and the evaluator do — the pattern *or* the request resource type having a dot
is enough to switch to the hierarchical matcher.

## Pattern matchers

### `matchesAction`

```ts
function matchesAction(pattern: string, action: string): boolean
```

`'*'` matches everything. A pattern ending in `':*'` matches any action sharing the prefix
including the colon. Everything else is an exact string comparison.

```ts
matchesAction('*', 'delete')            // true  - global wildcard
matchesAction('read', 'read')           // true  - exact
matchesAction('read', 'write')          // false
matchesAction('posts:*', 'posts:read')  // true  - prefix 'posts:'
matchesAction('posts:*', 'posts')       // false - the colon is part of the prefix
matchesAction('posts:*', 'users:read')  // false
```

### `matchesResource`

```ts
function matchesResource(pattern: string, resourceType: string): boolean
```

`'*'` matches everything. A pattern ending in `':*'` **or** `'.*'` matches any resource type
sharing the prefix including the separator. The separator is taken from the pattern, so a
dot pattern only matches dot-style resource types and a colon pattern only matches
colon-style ones. Everything else is exact.

```ts
matchesResource('*', 'post')                 // true
matchesResource('post', 'post')              // true
matchesResource('post', 'comment')           // false
matchesResource('org:*', 'org:project')      // true
matchesResource('org:*', 'org')              // false - separator required
matchesResource('post.*', 'post.draft')      // true
matchesResource('org', 'org:project:doc')    // false - a bare pattern is literal
matchesResource('org:*', 'org.project')      // false - separators do not mix
```

`matchesResource('org', 'org:project')` is `false`. There is no implicit parent matching:
to cover a subtree you must write the explicit `'org:*'` or `'org.*'` suffix. Writing the
bare parent and expecting children to match is a silent under-grant.

### `matchesResourceHierarchical`

```ts
function matchesResourceHierarchical(pattern: string, resourceType: string): boolean
```

The dot-only variant, used when either side contains a `.`. `'*'` is global, an exact match
wins, and only an explicit `'.*'` suffix enables the recursive prefix match. Unlike
`matchesResource`, a `':*'` suffix means nothing here.

```ts
matchesResourceHierarchical('*', 'anything')                    // true
matchesResourceHierarchical('dashboard', 'dashboard')           // true
matchesResourceHierarchical('dashboard', 'dashboard.users')     // false
matchesResourceHierarchical('dashboard.*', 'dashboard.users')   // true
matchesResourceHierarchical('dashboard.*', 'dashboard.a.b')     // true - recursive
matchesResourceHierarchical('dashboard.*', 'dashboard')         // false - parent excluded
```

### `matchesScope`

```ts
function matchesScope(
  pattern: string | undefined | null,
  scope: string | undefined | null,
): boolean
```

An **absent** pattern (`undefined` or `null`) or `'*'` matches any scope — that is a global
permission. Otherwise the request must carry a scope, and it must match exactly.

The checks are explicit, not truthiness: `''` is a scope *value*, not a missing one.
Reading an empty pattern as global made a row with `scope: ''` grant across every scope,
the opposite of what it looks like. `validateRole` now refuses `scope: ''` on the write
path for the same reason.

```ts
matchesScope(null, null)          // true  - global permission, no scope asked for
matchesScope(undefined, 'org-1')  // true  - global permission covers a scoped request
matchesScope('*', 'org-1')        // true
matchesScope('org-1', 'org-1')    // true
matchesScope('org-1', 'org-2')    // false
matchesScope('org-1', null)       // false - scoped permission, unscoped request
matchesScope('', 'org-1')         // false - '' is a scope, not "global"
```

`'*'` is global here because this is a *declared* scope on a role or permission. On an
**assignment** it is matched literally, which is why `iamAssertAssignableScope` refuses both
`''` and `'*'` on the write path.

## Field resolution

### `resolve`

```ts
function resolve(
  request: IamRequest.IAccessRequest,
  path: string,
  caches?: { path?: Map<string, string[] | null> },
): IamPrimitives.AttributeValue
```

Resolves a dot-path against an access request. `IamPrimitives.AttributeValue` is
`string | number | boolean | null` and the array forms.

| Behaviour | Detail |
|---|---|
| Roots | `ALLOWED_ROOTS` = `subject`, `resource`, `environment`. Anything else resolves to `null`. |
| Shorthands | `'action'` returns `request.action`; `'scope'` returns `request.scope ?? null`. Both are whole-path matches, checked before segment splitting. |
| Blocked segments | `__proto__`, `constructor`, `prototype` at any position make the whole path resolve to `null`. |
| Missing | A missing property resolves to `null`, never `undefined`. |
| `caches` | Optional per-engine segment cache. Omit it and the process-wide `pathCache` is used. |

```ts
import { resolve } from '@gentleduck/iam'

const request = {
  subject: { id: 'u-1', roles: ['editor'], attributes: { department: 'eng' } },
  action: 'update',
  resource: { type: 'post', id: 'p-5', attributes: { ownerId: 'u-1' } },
  environment: { ip: '10.0.0.1' },
}

resolve(request, 'subject.id')                     // 'u-1'
resolve(request, 'subject.roles')                  // ['editor']
resolve(request, 'subject.attributes.department')  // 'eng'
resolve(request, 'resource.attributes.ownerId')    // 'u-1'
resolve(request, 'environment.ip')                 // '10.0.0.1'
resolve(request, 'action')                         // 'update'
resolve(request, 'scope')                          // null
resolve(request, 'invalid.path')                   // null - unknown root
resolve(request, 'subject.__proto__.x')            // null - blocked segment
```

A `null` here is indistinguishable from a genuinely-null attribute, which is why
`validatePolicy` warns with `UNRESOLVABLE_FIELD` at authoring time rather than leaving you
to debug it at request time. See [validation](/duck-iam/advanced/validation).

### `PATH_CACHE_MAX` and `clearPathCache`

```ts
const PATH_CACHE_MAX: number   // 10_000
function clearPathCache(): void
```

`resolve` memoizes the split-and-validate step per path string. Entries are evicted
first-in-first-out once the map reaches `PATH_CACHE_MAX`; at roughly 200 bytes an entry
that caps the cache near 2 MB. Multi-tenant deployments should pass a per-engine cache
through the `caches` argument so one tenant's path churn cannot evict another's, and can
call `clearPathCache()` to flush the shared one periodically.

The map itself (`pathCache`) and the root set (`ALLOWED_ROOTS`) are not exported — see
[what is deliberately not exported](#what-is-deliberately-not-exported). `ALLOWED_ROOTS` is
nevertheless the same set `isResolvablePath` in the validator consults, and the two share
`BLOCKED_SEGMENTS` as well, which is what keeps the `UNRESOLVABLE_FIELD` warning honest
about `__proto__` paths as well as typo'd roots.

## Condition primitives

### `iamEvaluateOperator`

```ts
function iamEvaluateOperator(
  op: AccessControl.Operator,
  fieldValue: IamPrimitives.AttributeValue,
  condValue: IamPrimitives.AttributeValue,
): boolean
```

A thin wrapper over the internal operator table. It applies the operator directly — no
`$`-resolution, no operand-type guard, and none of `iamEvalCondition`'s refusal of a
user-sourced `matches` pattern.

```ts
import { iamEvaluateOperator as op } from '@gentleduck/iam'

op('eq', 'admin', 'admin')                  // true
op('neq', 'viewer', 'admin')                // true
op('gt', 10, 5)                             // true
op('gt', '10', 5)                           // false - both must be numbers
op('in', 'editor', ['admin', 'editor'])     // true
op('contains', ['a', 'b', 'c'], 'b')        // true - array holds the value
op('contains', 'hello world', 'world')      // true - substring
op('starts_with', 'hello', 'he')            // true
op('matches', 'user-123', '^user-\\d+$')    // true
op('exists', 'anything', null)              // true - field is not null
op('not_exists', null, null)                // true
op('subset_of', ['a'], ['a', 'b'])          // true
op('superset_of', ['a', 'b'], ['a'])        // true
op('before', '2024-01-01', '2025-01-01')    // true - ISO strings coerced
```

There are nineteen operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`,
`contains`, `not_contains`, `starts_with`, `ends_with`, `matches`, `exists`, `not_exists`,
`subset_of`, `superset_of`, `before`, `after`. Full semantics, including the missing /
`NaN` / empty-value edge cases, live on
[condition operators](/duck-iam/core/policies/conditions).

Two behaviours matter when calling the primitive directly. The numeric comparisons (`gt`,
`gte`, `lt`, `lte`) require both operands to be `number` and return `false` otherwise. And
`matches` **throws** `IamRegexInputTooLargeError` when the input string exceeds
`IAM_MAX_REGEX_INPUT_LENGTH` (2048) rather than returning `false`, so a deny-on-`matches`
rule cannot be flipped by an oversized input.

`iamEvaluateOperator` is the only handle on the operator table. The table itself is not
exported, because assigning to one of its entries retires every rule using that operator in
both evaluation modes.

### `iamResolveConditionValue` and `iamResolveValue`

```ts
function iamResolveConditionValue(
  req: IamRequest.IAccessRequest,
  value: IamPrimitives.AttributeValue,
): IamPrimitives.AttributeValue

function iamResolveValue(
  req: IamRequest.IAccessRequest,
  value: IamPrimitives.AttributeValue,
  caches?: { path?: Map<string, string[] | null> },
): IamPrimitives.AttributeValue
```

`iamResolveConditionValue` is the two-argument convenience form; `iamResolveValue` is the
same function with the optional per-engine path cache. Both resolve a `$`-prefixed string
by stripping the `$` and running the remainder through `resolve`. Any other value passes
through untouched.

```ts
import { iamResolveConditionValue } from '@gentleduck/iam'

const request = {
  subject: { id: 'u-1', roles: ['editor'], attributes: {} },
  action: 'update',
  resource: { type: 'post', attributes: { ownerId: 'u-1' } },
}

iamResolveConditionValue(request, '$subject.id')                   // 'u-1'
iamResolveConditionValue(request, '$resource.attributes.ownerId')  // 'u-1'
iamResolveConditionValue(request, '$nope.field')                   // null - unknown root
iamResolveConditionValue(request, 'literal-string')                // 'literal-string'
iamResolveConditionValue(request, 42)                              // 42
```

A `$`-reference that resolves to `null` is not the same as a literal `null` operand.
`iamEvalCondition` throws `IamOperandTypeError` on the former, because `resolve` answers
`null` for "unresolvable path", "attribute absent" and "explicitly null" alike, and `eq` is
a bare `===` — so `subject.attributes.tenant eq $resource.attributes.tenant` compared
`null === null` and allowed a request carrying neither attribute. A literal `value: null`
is an author explicitly testing for null and still works.

See [dollar variables](/duck-iam/core/policies/dollar-variables) for how these references
are authored, and [typed dollar paths](/duck-iam/advanced/config/dollar-paths) for the
compile-time version.

### `iamIsUserSourcedValue`

```ts
function iamIsUserSourcedValue(value: IamPrimitives.AttributeValue): boolean
```

`true` when the value is a string starting with `$`. `iamEvalCondition` uses it to refuse a
`matches` condition whose right-hand side is `$`-resolved: a user-controlled attribute must
never become a compiled regex.

Such a leaf **throws** `IamUserSourcedPatternError` — it does not evaluate to `false`.
Answering `false` reads as "condition not met", and the rule holding it is as likely to be a
deny as an allow: a `deny when email matches $resource.attributes.bannedPattern` rule never
fired and the banned subject came back ALLOWED, with nothing reported to `onPolicyError`.
Inside a `none` the negation turns it into a grant outright. Indeterminate is the only
answer that does not depend on which effect the rule carries.

```ts
iamIsUserSourcedValue('$subject.id')  // true
iamIsUserSourcedValue('^user-\\d+$')  // false
iamIsUserSourcedValue(42)             // false
```

### `iamIsCondition`

```ts
function iamIsCondition(
  item: AccessControl.ICondition | AccessControl.IConditionGroup,
): item is AccessControl.ICondition
```

Type guard distinguishing a leaf from a group: a leaf has a `field` key. Use it when
walking a condition tree you built yourself.

### `iamEvalCondition` and `iamEvalConditionGroup`

```ts
function iamEvalCondition(
  req: IamRequest.IAccessRequest,
  cond: AccessControl.ICondition,
  caches?: { regex?: Map<string, RegExp>; path?: Map<string, string[] | null> },
): boolean

function iamEvalConditionGroup(
  req: IamRequest.IAccessRequest,
  group: AccessControl.IConditionGroup,
  depth = 0,
  caches?: { regex?: Map<string, RegExp>; path?: Map<string, string[] | null> },
): boolean
```

The real evaluation entry points, as opposed to the raw `iamEvaluateOperator`.
`iamEvalCondition` refuses a user-sourced `matches` pattern, resolves both sides, applies
the operand-type table, then dispatches. `iamEvalConditionGroup` walks `all` / `any` /
`none`.

| Group | Result |
|---|---|
| `{ all: [...] }` | every item true |
| `{ any: [...] }` | at least one item true |
| `{ none: [...] }` | no item true |
| `{}` (literally no keys) | `true` — no conditions means unconditional |
| `depth >= IAM_MAX_CONDITION_DEPTH` | **throws** `IamConditionGroupError('depth', …)` |
| any other key set (a typo'd `all`, a hand-edited row) | **throws** `IamConditionGroupError('unknown-keys', …)` |

Both failure paths throw. Reading an uninterpretable group as "no conditions" turns a
conditional allow into an unconditional one; answering `false` retires a deny just as
silently, and that one was measured through `engine.can`. Neither verdict is honest about a
group nobody can interpret, so the group refuses and the engine fails closed on
Indeterminate.

The same applies one level down: `iamEvalCondition` throws `IamUserSourcedPatternError` for
a `$`-sourced `matches` pattern, `IamOperandTypeError` for an operand of the wrong type or
a `$`-reference that resolved to nothing, and `IamPatternRefusedError` for a pattern that
will not compile. Every one of those classes is exported from the root barrel so a `catch`
site can route it through `onPolicyError` rather than comparing `err.name` strings.

The one exception is a rule inside the synthetic `'__rbac__'` policy, where a throw abstains
instead of failing the policy closed. That is safe only there, because `rolesToPolicy`
emits `allow` and nothing else.

Only `{}` with literally no keys is unconditional. `{ all: [] }` is the canonical spelling.

### `iamGetCachedRegex`, `iamClearRegexCache`, and the regex constants

```ts
function iamGetCachedRegex(pattern: string, cache?: Map<string, RegExp>): RegExp | null
function iamClearRegexCache(): void
const IAM_REGEX_CACHE_MAX: number         // 256
const IAM_MAX_REGEX_LENGTH: number        // 128 - longest pattern accepted
const IAM_MAX_REGEX_INPUT_LENGTH: number  // 2048 - longest input matched against one
const IAM_MAX_CONDITION_DEPTH: number     // 10
```

`iamGetCachedRegex` compiles a `matches` pattern once and stores it in an LRU keyed by the
pattern string; a hit re-inserts the entry to refresh recency. It returns `null` — rather
than a compiled regex — for any pattern `iamDetectCatastrophicRegex` rejects and for any
pattern that does not compile, so a hostile pattern that reached the runtime past the
validator never becomes a `RegExp`. Eviction is least-recently-used, bounded at
`IAM_REGEX_CACHE_MAX`, so pattern churn from one tenant cannot grow memory without bound.
Pass a per-engine cache to keep tenants from evicting each other, or call
`iamClearRegexCache()` to flush the process-wide one.

The cache map itself is not exported: seating a permissive `RegExp` under a pattern a deny
rule relies on is a one-line bypass.

## Explain helper

### `iamEscapeHtml`

```ts
function iamEscapeHtml(s: string): string
```

Replaces `&`, `<`, `>`, `"`, `'` with HTML entities, ampersand first so nothing
double-escapes. It exists for exactly one job: the explain trace's `summary` and its
condition `actual` / `expected` strings carry operator-supplied policy names and
request-derived attribute values verbatim, and the explain pipeline never escapes for any
rendering target.

```ts
import { iamEscapeHtml } from '@gentleduck/iam/core/explain'

const trace = await engine.explain('u-1', 'read', { type: 'post' })
panel.innerHTML = `<pre>${iamEscapeHtml(trace.summary)}</pre>`
```

## Cache and key helpers

These four are exported from the package root only.

### `IamLRUCache` and `iamLRUCache`

```ts
class IamLRUCache<V> {
  constructor(maxSize: number, ttlMs: number)
  get(key: string): V | undefined
  set(key: string, value: V): void
  delete(key: string): boolean
  clear(): void
  resetStats(): void
  get stats(): { hits: number; misses: number; size: number }
  get size(): number
  entries(): IterableIterator<[string, V]>
}

function iamLRUCache<V>(maxSize: number, ttlMs: number): IamLRUCache<V>
```

The LRU with TTL the engine uses for its policy, role, RBAC-policy, merged-policy, and
subject caches. `iamLRUCache` is the factory form for callers who prefer functions to `new`.

| Member | Behaviour |
|---|---|
| `constructor` | Throws `RangeError` when `maxSize` is not finite or below 1, or when `ttlMs` is not finite or negative. |
| `get` | Refreshes recency on a hit. A miss or an expired entry returns `undefined` and increments `misses`; an expired entry is also deleted. |
| `set` | Deletes then re-inserts, so it refreshes both recency and TTL. Evicts the oldest entry at capacity. |
| `clear` | Drops entries but keeps the hit/miss counters. |
| `resetStats` | Zeroes the counters but keeps the entries. |
| `entries` | Yields non-expired entries and does **not** refresh recency. |

```ts
import { iamLRUCache } from '@gentleduck/iam'

const cache = iamLRUCache<string[]>(500, 30_000) // 500 entries, 30s TTL
cache.set('u-1', ['editor'])
cache.get('u-1')      // ['editor']
cache.stats           // { hits: 1, misses: 0, size: 1 }
```

### `iamBuildPermissionKey`, `iamParsePermissionKey`, `iamSplitPermissionKey`

```ts
function iamBuildPermissionKey(
  action: string,
  resource: string,
  resourceId?: string,
  scope?: string,
): string

function iamParsePermissionKey(key: string): {
  scope: string | undefined
  action: string
  resource: string
  resourceId: string | undefined
} | null

function iamSplitPermissionKey(key: string): string[]
```

The permission-map key format is `[@scope:]action:resource[:resourceId]`. The `@` on the
scope is load-bearing: without it, `('read', 'doc', '42')` and
`('doc', '42', undefined, 'read')` both produced `read:doc:42`, so two different checks in
one `checkMany` shared a map entry and one could answer for the other. A scoped key is the
only one that may start with an unescaped `@`, which is what makes the arity unambiguous.

Within each segment a literal `\` becomes `\\`, a literal `:` becomes `\:`, and a leading
`@` is escaped too, so a resource id containing a colon cannot forge an extra segment.
`iamSplitPermissionKey` reverses that, honouring only those escape sequences — an
attacker-crafted `\x` stays `\x` rather than becoming `x`. `iamParsePermissionKey` goes
further and returns the named fields, or `null` for a string that is not a well-formed key,
so a hand-built one is rejected rather than guessed at.

```ts
import { iamBuildPermissionKey, iamParsePermissionKey } from '@gentleduck/iam'

iamBuildPermissionKey('read', 'document')
// 'read:document'
iamBuildPermissionKey('read', 'document', 'doc-1')
// 'read:document:doc-1'
iamBuildPermissionKey('write', 'doc', 'a:42', 'tenant_a')
// '@tenant_a:write:doc:a\\:42'

iamParsePermissionKey('@tenant_a:write:doc:a\\:42')
// { scope: 'tenant_a', action: 'write', resource: 'doc', resourceId: 'a:42' }
```

The presence check is `!== undefined`, not truthiness.
`iamBuildPermissionKey('read', 'doc', undefined, '')` produces `'@:read:doc'`, a key
distinct from the unscoped `'read:doc'`. Passing an empty scope where you meant "no scope"
silently produces a key nothing will ever match — the same trap as `scope: ''` on a role,
which the validator refuses outright.

See [permission maps](/duck-iam/integrations/client/permission-map) for how these keys reach
the client.

## Row parsers for adapter authors

Writing a custom adapter means crossing from `unknown` (JSON, a SQL column, a Redis blob)
into the typed domain. Do it through the parsers, never through a cast:

```ts
import { parsePolicyRow, parseRoleRow } from '@gentleduck/iam/core/validate'
import type { AccessControl, IamAdapter } from '@gentleduck/iam'

class MyAdapter implements IamAdapter.IAdapter {
  async listPolicies(): Promise<AccessControl.IPolicy[]> {
    const rows = await this.store.fetchPolicies()
    const out: AccessControl.IPolicy[] = []
    for (const row of rows) {
      const policy = parsePolicyRow(row)
      if (policy === null) {
        // Refuse, do not skip: the dropped policy may have been the one that denies.
        this.onPolicyError?.(new Error(`policy "${row.id}" cannot be read`))
        throw new Error(`policy "${row.id}" cannot be read`)
      }
      out.push(policy)
    }
    return out
  }
}
```

`parsePolicyRow` returns `null` on any error-level validation failure; warnings still return
the row, and on success it returns the identical object rather than a copy.

The shipped file, HTTP, Redis, Drizzle and Prisma adapters treat the two asymmetrically, and
a custom adapter should too.

A malformed **policy** row is reported and then **throws** `iamUnreadablePolicy`, so one bad
row denies every request until it is repaired. A malformed **role** row is reported and
dropped. The reason is which direction each can fail in: `rolesToPolicy` emits `allow` and
nothing else, so a lost role can only cost a subject a grant, while a lost policy may have
been the rule saying no — and under `policyCombine: 'and'` even an allow-only policy votes
deny when none of its rules match. There is no subset of policies an adapter can safely drop
without knowing the combine mode, which it does not.

Reporting goes through `onPolicyError` on drizzle, redis, file and http. Prisma's
constructor takes no options object, so it reports through `console.warn`.

The memory adapter does neither: it validates on neither read nor constructor seed.

Typical reasons to need this:

* A JSON-column SQL adapter whose rows can be edited by hand.
* A migration tool copying rows between stores, where dropping is better than crashing.
* A staging endpoint that previews operator-proposed policies before commit.

See [custom adapters](/duck-iam/integrations/adapters/custom) for the full interface and
[validation](/duck-iam/advanced/validation) for what counts as malformed.

## Gotchas

* **The matchers are not symmetric.** `matchesResource` accepts both `':*'` and `'.*'`;
  `matchesResourceHierarchical` accepts only `'.*'`. The evaluator picks between them on
  whether either side contains a dot, so a colon-style resource type never reaches the
  hierarchical matcher.
* **`resolve` returns `null`, not `undefined`,** for both "path invalid" and "value
  missing". Downstream operators like `exists` treat the two identically.
* **`iamEvaluateOperator` skips every guard.** Only `iamEvalCondition` refuses a
  `$`-resolved regex and applies the operand-type table. If you build a custom pipeline on
  the raw operator, check `iamIsUserSourcedValue` and the operand type yourself — a wrongly
  typed operand made `nin` short-circuit to `true`, so an "allow unless denylisted" rule
  admitted everyone.
* **The process-wide caches are shared and not exported.** In a multi-tenant process, pass
  per-engine caches through the `caches` argument; flush the shared ones with
  `clearPathCache()` and `iamClearRegexCache()`.
* **`IamLRUCache.clear()` keeps stats; `resetStats()` keeps entries.** They are deliberately
  independent.
* **Engine-supplied policies are deep-frozen.** The synthetic RBAC policy the engine caches
  is recursively `Object.freeze`d — the policy, its `rules` array, each rule, each rule's
  `actions` and `resources` arrays, and the whole condition tree. `evaluate`, `evaluateFast`,
  and `explain` all read the same reference, so mutating one would corrupt every later
  request. In strict mode the write throws; build your own copy instead.

## See also

* [Explain traces](/duck-iam/advanced/explain) — the tracer that calls every function on this page.
* [Validation](/duck-iam/advanced/validation) — `parsePolicyRow`, the limits, and the ReDoS screen.
* [Rule matching](/duck-iam/core/rule-matching) — the matchers in the context of a full rule.
* [Condition operators](/duck-iam/core/policies/conditions) — per-operator semantics and edge cases.
* [Engine caching](/duck-iam/advanced/engine/caching) — where `IamLRUCache` is wired in.