The engine caches five things, coalesces concurrent misses so a cold start does not stampede the adapter, and exposes four invalidation calls that clear precisely-scoped subsets. This page documents every cache key, every trigger, and the ordering guarantees that make mid-flight invalidation safe.

## The five caches

Each is an `IamLRUCache` - a `Map` with insertion-order LRU eviction and a per-entry TTL.

| Cache | Key | Max entries | Expires at | Value |
| --- | --- | --- | --- | --- |
| Policy | `'all'` | 1 | `now + cacheTTL` | Raw `AccessControl.IPolicy[]` from `adapter.listPolicies()` |
| Role | `'all'` | 1 | `now + cacheTTL` | Raw `AccessControl.IRole[]` from `adapter.listRoles()` |
| RBAC policy | `'rbac'` | 1 | `min(now + cacheTTL, roleCache.expiresAt)` | The deep-frozen synthetic `__rbac__` policy built by `rolesToPolicy()` |
| Merged policies | `'merged'` | 1 | `min(now + cacheTTL, policyCache.expiresAt, rbacPolicyCache.expiresAt)` | `[rbacPolicy, ...policies]`, or just `policies` when RBAC produced no rules |
| Subject | subject ID | `maxCacheSize` (default `1000`) | `min(now + cacheTTL, grantBoundary)` | `IamRequest.ISubject` - resolved roles, scoped roles, attributes |

A sixth, the compiled table, is a plain field rather than an LRU, stamped `_derivedBuiltAt + cacheTTL`.

The `min(...)` column is the invariant three separate bugs converged on: **a derived cache is never fresher than its oldest input.** `IamLRUCache.set` takes an optional `notAfter` that only ever *shortens* an entry — a non-finite value is ignored, and a value already in the past stores nothing at all. The compiled table computes the same bound itself, stamping the moment its oldest input was read rather than `Date.now()`. Without that, the two clocks separate whenever something nulls the table without clearing the role cache, which is exactly what `savePolicy`, `deletePolicy` and an inbound `{kind: 'policies'}` event all do: measured at `cacheTTL: 60`, a revoke written at t=1s still answered allow at t=111s.

`cacheTTL` is in **seconds** and is multiplied by 1000 when the caches are constructed. Only the subject cache is sized by `maxCacheSize`; the other four hold one whole collection each, so a single slot is enough and a save overwrites the entry under the same key.

`IamLRUCache` semantics worth knowing:

* `get` on an expired entry deletes it and counts a **miss**, so a TTL expiry shows up in `engine.stats.get()` exactly like a cold read.
* `get` on a live entry re-inserts it to refresh LRU position, which is why the subject cache dominates the cost profile of a fully warm check.
* `clear()` drops entries but **does not** reset the hit/miss counters. Only `engine.stats.reset()` does that.
* `cacheTTL: 0` is **not** a clean "off" switch. Every entry is expired the instant it is written *and* the compiled table is rebuilt on every request, so each check re-reads `listRoles` and `listPolicies` and re-runs `compileTable`. Correct, and very slow. Tests only.
* `expiresAt(key)` reads a live entry's expiry without touching LRU order or the hit/miss counters — that is bookkeeping about an entry, not a read of it, and counting it would make the stats lie.
* `entries()` and `get()` agree at the expiry millisecond: both use `>=`, so a grant is inactive at the exact millisecond it expires. Under `>` the iterator yielded an entry the reader could not then fetch.

### State that is not an LRU cache

| Structure | Scope | Cleared by |
| --- | --- | --- |
| Single-flight slots (`policies`, `roles`, `rbac`, `merged`) | Per engine, one promise each | The matching `invalidate*` call |
| Single-flight subject map | Per engine, keyed by subject ID | `invalidateSubject`, `invalidateRoles`, `invalidate` |
| Compiled table + generation counter | Per engine, **both** modes | Every `invalidate*` except `invalidateSubject` |
| Regex + dot-path `Map`s | **Per engine instance** | Nothing; they are bounded by pattern variety, not TTL |
| Process-wide regex + dot-path caches | Per process, shared by every engine | `iamFlushSharedCaches()` only |
| Rule index | A `WeakMap` keyed on the policy object itself | Garbage collection, when the policy array is replaced |

The per-instance regex and path caches are a multi-tenant safety property: one engine per tenant means a hostile tenant flooding patterns cannot evict another tenant's compiled regexes. The rule index needs no invalidation at all - a cache refresh produces new policy objects, which get fresh index entries while the old ones are collected.

## The read path

Node `D` is the single-flight coalescer: a burst of concurrent cold checks issues **one** adapter call, not one per caller. Node `L` is the stale-write guard - if an `invalidate*` cleared the slot while the adapter call was in flight, the late resolver is not allowed to repopulate the cache with data the invalidation already superseded. Node `F` is the `maxConcurrentSubjectLoads` load shed, which only ever gates a *new* subject: a cache hit, or joining an existing in-flight load for the same subject, never counts against the cap.

The loaders compose:

| Loader | Depends on | Cache |
| --- | --- | --- |
| `listPolicies` | adapter only | Policy |
| `listRoles` | adapter only | Role |
| RBAC policy | roles | RBAC policy |
| Merged policies | policies + RBAC policy | Merged policies |
| Subject | `getSubjectRoles`, `getSubjectAttributes`, roles, optional `getSubjectScopedRoles` | Subject |

The RBAC policy is [deep-frozen](/duck-iam/core/roles/roles-to-policy) before being cached, so a consumer mutating a rule from a cached policy throws in strict mode rather than silently poisoning every subsequent evaluation.

### Subject resolution

`resolveSubject` is the only per-key loader. On a miss it issues four reads concurrently - `getSubjectRoles`, `getSubjectAttributes`, the role list (needed for the inheritance graph, which cannot be expanded from a subject's directly assigned ids alone), and the optional `getSubjectGrantBoundary` - then closes the assigned roles over `inherits` via `resolveEffectiveRoles` (cycle-safe, depth-capped at 32). `getSubjectScopedRoles`, when the adapter has it, runs after, because it needs the resolved role list.

#### Time-boxed grants

An adapter may implement `getSubjectGrantBoundary(subjectId, opts)`, returning the next instant this subject's grants change, or `null`. The drizzle adapter computes it as `min(startsAt, expiresAt)` over the future. It rides in the same `Promise.all` as the reads it describes, because asking afterwards would add a round trip to every cold subject.

Without it, a 30-second break-glass grant under the default 60-second TTL kept granting for 90 seconds: the store had dropped it, the cache had not.

The boundary is **advisory**, and every way a store can get it wrong lands on "cache less", never on "grant longer":

| Boundary returned | Effect |
| --- | --- |
| A finite instant before `now + cacheTTL` | Entry capped there |
| A finite instant after the TTL | Ignored; `cacheTTL` is still the ceiling |
| `null` | Full TTL - it means "nothing changes for a while" |
| `NaN`, `±Infinity` | Ignored, full TTL |
| A bound already past, including `0` | Nothing is cached; the next call re-reads |
| The method **throws** | The subject is resolved but not cached at all, plus one `console.warn` naming the subject and the method |

The throw row is the one to internalise. A boundary the store could not produce is not a boundary of `null` - treating it as one buys the entry a full TTL, which is exactly the stale allow the boundary exists to prevent. The window is still enforced by the read itself; only the caching is lost.

Scoped assignments are closed over `inherits` too, since 5.4.0. The directly-assigned role keeps the scope of the row it came from; each *inherited* role is retagged with its own `IRole.scope` when it declares one, falling back to the assignment row's scope. Without that, a deployment that scopes every assignment would have an empty `subject.roles` and a condition reading `subject.roles` would behave as if the hierarchy did not exist.

## Invalidation

Read the diagram as an intersection, not a union: `invalidatePolicies` does **not** clear the role or RBAC caches, and `invalidateRoles` does **not** clear the policy cache. Both clear the merged cache, because the merged view is derived from both halves.

### What each call clears, in order

**`engine.cache.invalidate(opts?)`**

1. Policy cache, role cache, RBAC policy cache, subject cache - all cleared.
2. All four single-slot in-flight promises nulled.
3. Merged cache cleared.
4. In-flight subject map cleared.
5. Publishes `{ kind: 'all' }` unless `broadcast: false`.
6. Drops the compiled table and bumps the generation counter.

**`engine.cache.invalidateSubject(subjectId, opts?)`**

1. Returns immediately - a silent no-op - if `subjectId` is not a string, is empty, or exceeds 1024 characters.
2. Deletes that key from the subject cache and from the in-flight subject map.
3. Publishes `{ kind: 'subject', subjectId }` unless `broadcast: false`.
4. Leaves the compiled table alone. Subject data is never baked into it.

**`engine.cache.invalidatePolicies(opts?)`**

1. Policy cache cleared, its in-flight slot nulled.
2. Merged in-flight slot nulled, merged cache cleared.
3. Publishes `{ kind: 'policies' }` unless `broadcast: false`.
4. Drops the compiled table and bumps the generation counter.

**`engine.cache.invalidateRoles(roleId?, opts?)`**

1. If `roleId` is present but not a valid 1-to-1024-character string, it is treated as absent - the call degrades to the safe clear-everything path rather than silently matching nothing.
2. Role cache and RBAC policy cache cleared; their in-flight slots nulled.
3. Merged in-flight slot nulled, merged cache cleared.
4. **Every** subject in-flight slot is cleared, unconditionally. Then, without a `roleId`, the whole subject cache is cleared; with one, only subjects whose `roles` include it or whose `scopedRoles` grant it are evicted.
5. Publishes `{ kind: 'roles', roleId }` unless `broadcast: false` - carrying the *normalised* `roleId`, so a peer that receives the event performs the same clear-all the local engine did.
6. Drops the compiled table and bumps the generation counter.

Because subject entries hold roles already closed over `inherits`, the selective eviction in step 4 catches transitive holders: a subject assigned `admin` is evicted by `invalidateRoles('viewer')` when `admin` inherits `viewer`, since `viewer` is present in that subject's resolved role list.

The in-flight sweep has to be unconditional for a reason the narrowed cache sweep does not share. The cache sweep can inspect a resolved subject and skip it honestly; an in-flight load has no cache entry yet - that is what "in flight" means - so it could never be reached by a narrowed sweep. A load that started before a revoke resolved with the pre-revocation role set afterwards, passed the single-flight identity check, and was written with a **full** TTL, keeping the revoked role live for the whole window. The cost of the fix is one redundant reload of subjects that were mid-flight when the invalidation landed.

### Automatic triggers

Every `engine.admin` write invalidates before returning.

| Admin call | Invalidation |
| --- | --- |
| `savePolicy` / `deletePolicy` | `invalidatePolicies()` |
| `saveRole(role)` | `invalidateRoles(role.id)` - selective subject eviction |
| `deleteRole(id)` | `invalidateRoles(id)` - selective subject eviction |
| `assignRole` / `revokeRole` | `invalidateSubject(subjectId)` |
| `assignRoles` / `revokeRoles` / `moveRoleScopes` | each affected subject once, however many rows named it - and **every requested** subject when the batch throws part-way |
| `invalidateSubjects(ids)` | those subjects, duplicates collapsed |
| `updateAssignmentScope` | `invalidateSubject(subjectId)` |
| `setAttributes` | `invalidateSubject(subjectId)` |
| `import(snapshot)` | `invalidatePolicies()` then `invalidateRoles()` - once, after all writes |
| `export` and every read | nothing |

`saveRole` and `deleteRole` pass the role ID, so they evict only the subjects that hold that role - not the entire subject cache. `import` deliberately invalidates once at the end rather than per row, because a bulk write would otherwise pay per-row invalidation overhead.

You need manual invalidation only when authorization data changes outside `engine.admin`: another service writing the shared database directly, an IdP or SCIM webhook, or a test that wants a guaranteed fresh load.

### The compiled table generation counter

The [compiled table](/duck-iam/advanced/engine/compiled) - which both modes read - is a derived cache with a subtler invalidation rule, because building it is asynchronous.

Every invalidation nulls the table and increments a generation counter. A rebuild records the generation it started under; when it finishes, it installs its result **only if the generation has not moved**. A caller that arrives after a later invalidation is never handed the in-flight promise from the older generation - it starts or joins a fresh build instead. The engine test `a caller arriving after an invalidation that lands mid-rebuild never gets the stale in-flight table` pins exactly that, and a property test drives overlapping `invalidateRoles` / `invalidatePolicies` / `invalidate` calls against concurrent `authorize()` traffic and checks the settled state against a freshly-built oracle table.

The net guarantee: an invalidation that lands mid-build always wins over the build it raced.

## Multi-instance deployments

Every cache is per process. In a multi-node deployment, one node's `engine.admin` write leaves the other nodes serving stale decisions until their TTL expires. Three ways out, in increasing order of effort.

`cacheTTL: 5` bounds staleness to five seconds at the cost of more adapter
reads. For most fleets that is enough, and it needs no extra infrastructure.

### Pub/sub invalidation

Wire `IConfig.invalidator` and the engine handles the fan-out: every local `engine.admin` mutation publishes an event, and every inbound event is applied locally with `broadcast: false` so instances never ping-pong - republishing a received event would make each instance echo every other's evictions, and the traffic would grow with the square of the fleet.

```ts
import { IamEngine } from '@gentleduck/iam'
import { createIamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'

const engine = new IamEngine({
  adapter,
  invalidator: createIamRedisInvalidator({ client: redisPubSub, channel: 'iam:invalidate' }),
})

process.on('SIGTERM', () => engine.dispose())
```

The Redis helper filters an instance's own events back out by instance ID, so a node never re-applies what it just published. See [the Redis invalidator](/duck-iam/integrations/invalidators/redis) for the channel, envelope format and signing.

The contract is small enough to implement over any bus:

```ts
import type { IamEngineTypes } from '@gentleduck/iam'

const invalidator: IamEngineTypes.IInvalidator = {
  publish(event) {
    nats.publish('iam.invalidate', JSON.stringify(event))
  },
  subscribe(handler) {
    const sub = nats.subscribe('iam.invalidate', (msg) => handler(JSON.parse(msg.data)))
    return () => sub.unsubscribe()
  },
}
```

`publish` may return `void` or a promise; the engine calls it fire-and-forget. `subscribe` must return a teardown function, which `engine.dispose()` invokes.

`IConfig.invalidator` is constructor-only, but engines are commonly built at module import time, before any replica-specific client exists. `engine.setInvalidator(invalidator | null)` attaches one later: it validates that `publish` and `subscribe` are callable and throws `TypeError` otherwise, tears down the previous subscription first and unconditionally so at most one is ever attached, and takes `null` to detach. The constructor routes `config.invalidator` through the same setter.

The event union is four members, discriminated on `kind`:

| Event | Applied as |
| --- | --- |
| `{ kind: 'all' }` | `invalidate({ broadcast: false })` |
| `{ kind: 'policies' }` | `invalidatePolicies({ broadcast: false })` |
| `{ kind: 'roles', roleId?: TRole }` | `invalidateRoles(roleId, { broadcast: false })` |
| `{ kind: 'subject', subjectId: string }` | `invalidateSubject(subjectId, { broadcast: false })` |

Delivery only needs to be at-least-once: every invalidate is idempotent, so re-applying an event is harmless. Applying an `'all'`, `'policies'` or `'roles'` event also drops the receiving engine's compiled table; a `'subject'` event does not, because subject data is not compiled in.

### Versioned policies

Tag policies with `version`, increment on write, and refetch when the stored version outranks the cached one. duck-iam does not ship this - build it into your adapter if you need read-your-writes consistency without pub/sub.

## Tuning

```ts
// High traffic, policies change rarely
new IamEngine({ adapter, cacheTTL: 300, maxCacheSize: 10_000 })

// Near-real-time permission changes
new IamEngine({ adapter, cacheTTL: 5, maxCacheSize: 500 })

// Tests: no caching, and a table rebuild on every request
new IamEngine({ adapter, cacheTTL: 0 })
```

Rough memory guidance - measure your own workload, these scale with attribute and rule size:

* Subject cache: on the order of 1 KB per cached subject.
* Role cache: a few hundred bytes per role.
* Policy cache: a couple of KB per policy.
* RBAC policy cache: one entry sized to roles times permissions, after inheritance expansion. It grows faster than you expect with deep inheritance, because `rolesToPolicy` emits one rule per role per *inherited* permission.

If memory is tight, lower `maxCacheSize` and let LRU eviction keep the hot subjects. Cold subjects paying an adapter round trip is usually the right trade.

## Gotchas

* **`invalidateSubject` with a bad ID is a silent no-op.** It does not throw and does not fall back to clearing everything. `invalidateRoles` with a bad role ID does the opposite: it clears everything. Both are soft on purpose - this is a cache eviction, and the id may have arrived from another process over the invalidator, where refusing it loudly would be worse than doing nothing.
* **`cache.invalidateSubject` does not rebuild the compiled table.** It does not need to; but if you were relying on a subject invalidation to pick up a *policy* change, it will not.
* **`clear()` does not reset stats.** A cache hit rate that looks impossibly high after a flush is counters carried over from before it.
* **`iamFlushSharedCaches()` is not `engine.cache.invalidate()`.** It clears the process-global regex and dot-path caches - the fallbacks used by direct `evaluate()` / operator calls and by `explain()`. Every `can()` path uses the engine's own per-instance maps, which it does not touch, so it is **not** a multi-tenancy mitigation and needs no periodic schedule.
* **The subject cache is the cost centre.** A fully warm production check spends roughly half its time in the subject cache's LRU re-insert, not in evaluation.
* **A mid-flight invalidation discards the in-flight result rather than serving it.** The next caller pays a fresh load. That is deliberate: serving the superseded value would be worse.

## See also

* [Engine overview](/duck-iam/advanced/engine)
* [Engine methods](/duck-iam/advanced/engine/methods)
* [Admin API](/duck-iam/advanced/engine/admin)
* [Compiled table](/duck-iam/advanced/engine/compiled)
* [Redis invalidator](/duck-iam/integrations/invalidators/redis)