`IamRedisAdapter` keeps the whole store in four kinds of Redis key: two hashes for policies and roles, one set per subject for assignments, one string per subject for attributes. It needs twelve commands from your client, all of which ioredis, node-redis v4+, and Upstash implement directly, so there is no hard dependency on any Redis library.

## Install

`ioredis` and `redis` are both optional peer dependencies; install whichever you use.

```ts
import { IamRedisAdapter, iamRedisAdapter } from '@gentleduck/iam/adapters/redis'
import type { IamRedis } from '@gentleduck/iam/adapters/redis'
```

## Setup

```ts title="ioredis"
import Redis from 'ioredis'
import { IamEngine } from '@gentleduck/iam'
import { IamRedisAdapter } from '@gentleduck/iam/adapters/redis'

const adapter = new IamRedisAdapter({
  client: new Redis(process.env.REDIS_URL!),
  keyPrefix: 'iam:',
  onPolicyError: (err, ctx) => logger.error({ err, ...ctx }, 'iam row dropped'),
})

const engine = new IamEngine({ adapter })
```

```ts title="node-redis v4+"
import { createClient } from 'redis'
import { IamRedisAdapter } from '@gentleduck/iam/adapters/redis'

const client = createClient({ url: process.env.REDIS_URL })
await client.connect()

const adapter = new IamRedisAdapter({ client, keyPrefix: 'iam:' })
```

```ts title="Upstash (REST)"
import { Redis } from '@upstash/redis'
import { IamRedisAdapter } from '@gentleduck/iam/adapters/redis'

const adapter = new IamRedisAdapter({ client: Redis.fromEnv(), keyPrefix: 'iam:' })
```

`iamRedisAdapter(config)` is the same constructor behind a factory function.

## Options

`IamRedis.IConfig

The two global keys grow with the size of your policy and role set; the per-subject keys grow with your user count, two keys each. Nothing is ever expired by the adapter — no `EXPIRE` is issued on any key — so persistence is entirely your Redis configuration's problem. Turn on AOF or RDB snapshots if you do not want the store to vanish on restart.

`listPolicies` is a single `HGETALL` on `${p}policies`, so the whole policy set crosses the wire on every cold read. That is fine at the scale the engine caps you at (`maxPolicies` / `maxRoles`, both default `10_000`) and is the reason to pair this adapter with the engine's in-process LRU rather than reading through to Redis on every check.

### Assignment member encoding

A set member packs the role and the scope into one string separated by a NUL byte (`0x00`):

```text
editor\x00           -> { role: 'editor' }                    (unscoped, empty scope tail)
admin\x00org-1       -> { role: 'admin', scope: 'org-1' }
team lead\x00us west -> { role: 'team lead', scope: 'us west' }
```

Set semantics do the deduplication, which is what makes `assignRole` idempotent: adding the same `(role, scope)` twice is one `SADD` that returns 0 the second time.

`assignRole` throws when either string contains `0x00`, because it is the separator: a crafted role id could inject one and be decoded as a different `(role, scope)` pair — a privilege drift, not just a parse error. Role ids are validated against control characters at `saveRole` too, so the adapter refuses to store a role `assignRole` would then refuse to grant. Every other byte, spaces included, is safe.

### `deleteRole` and the sweep

`deleteRole` removes the role from the hash and then removes every grant naming it, because a role that outlives its own grants is a role that comes back: recreate it under the reused id and everyone who once held it holds it again, with nobody granting anything.

There is no foreign key to do this, so the adapter runs `KEYS ${prefix}assignments:*`, reads each set's members, and `SREM`s the ones whose decoded role matches — each key's rewrite serialised so a concurrent `assignRole` on that subject cannot land between the read and the removal. A whole-keyspace sweep is acceptable because deleting a role is an admin-rate operation and never on a request path. A reverse index was rejected as the alternative: it would cascade only for grants written after the index existed and silently miss every older one.

The prefix is escaped before it reaches that pattern — `globLiteral` backslash-escapes `\ * ? [ ]`, the metacharacters `KEYS` understands. A prefix of `app[1]:` interpolated raw turns `[1]` into a character class, so the sweep misses every key it owns *and* matches `app1:assignments:*`, a different tenant's namespace, where it removes that tenant's grants of the same role id. Two failures at once, neither of which raises anything.

Escaping cannot help with a literal overlap, though. With `keyPrefix: 'iam:'` the sweep pattern is `iam:assignments:*`, whose trailing `*` matches any suffix, so a second adapter configured with `keyPrefix: 'iam:assignments:'` has every one of its keys inside the first adapter's sweep. Do not nest one prefix inside another.

`keys` is optional on `ILike`. When the client does not expose it the role is deleted and its grants are not, and the adapter says so through `onPolicyError` with `rowId: "roles:

Both `getSubjectRoles` and `getSubjectScopedRoles` decode legacy members before returning, then kick off the migration if it is enabled, so a read never blocks on it and never returns stale data. When the client exposes `eval`, the migration is one Lua script that `SADD`s the new form and `SREM`s the old one per member — atomic and safe across processes. Without `eval`, the adapter falls back to an in-process promise chain keyed on the assignments key, which serialises the migration against `assignRole` and `revokeRole` in *this* process only.

On a client with no `eval`, a migration running in process A can `SADD` the re-encoded member after process B's `revokeRole` has already `SREM`ed it, resurrecting a just-revoked grant. The in-process lock cannot see process B. Use a client that supports `EVAL` (ioredis and node-redis both do) if you run more than one writer. A migration failure is never fatal: it reports through `onPolicyError` with `rowId: "assignments:<subjectId>"` and leaves the original member in place to be retried on the next read.

The in-process lock is what keeps every read-modify-write against one subject from interleaving, migration or not. It is deleted only when the stored promise is still the one that settled; inverting that identity check drops a *concurrent* writer's lock and lets a later write run straight into an in-flight one, which 33 tests did not notice.

`revokeRole` with a scope defends against a partially migrated set by `SREM`ing both encodings in one call — the NUL form and the legacy `"<role> <scope>"` form.

## Transactions and consistency

Redis commands are individually atomic; the adapter groups nothing into `MULTI`.

| Operation | Commands | Atomic? |
| --- | --- | --- |
| `savePolicy` / `saveRole` | one `HSET` | yes |
| `deletePolicy` | one `HDEL` | yes |
| `getPolicy` / `getRole` | one `HGET` | yes |
| `listPolicies` / `listRoles` | one `HGETALL` | yes, a point-in-time snapshot |
| `assignRole` | one `SADD` | yes, and idempotent |
| `revokeRole` with a scope | one `SREM` covering both encodings | yes |
| `revokeRole` without a scope | `SMEMBERS`, filter, then `SREM`, serialised per key | in this process only — a writer in another process can land between the two |
| `deleteRole` | `HDEL`, then `KEYS` + per-key `SMEMBERS`/`SREM` | no — the role goes first, then the sweep |
| `getSubjectAttributes` | one `GET` | yes |
| `setSubjectAttributes` | `GET`, merge in JavaScript, `SET` | **no** — read-modify-write |

The merge is `{ ...existing, ...attrs }` computed between a `GET` and a `SET`, so two concurrent patches to the same subject can leave only one of them. Use a Lua script or `WATCH`/`MULTI`/`EXEC` against `${p}attrs:${subjectId}` if you patch attributes under contention.

Connection failures surface on every read and on every write except `setSubjectAttributes`: they reject with the driver's error rather than degrading to `[]`, `null` or a reported success.

## Scope

Scope lives inside the set member, after the NUL. An empty tail is a global grant; anything else is a scoped one.

`getSubjectRoles` and `getSubjectScopedRoles` both `SMEMBERS` the same key and split the decoded results:

```ts
await adapter.assignRole('alice', 'admin', 'org-1')
await adapter.assignRole('alice', 'viewer')

await adapter.getSubjectRoles('alice')        // ['viewer']
await adapter.getSubjectScopedRoles('alice')  // [{ role: 'admin', scope: 'org-1' }]
```

Until 2.1.0 this adapter collapsed scoped and unscoped assignments into one list, so a role granted only for `org-1` was visible in every scope and the same subject decided differently here than under the memory or file adapter. It now skips any member with a non-empty scope tail. If you build your own Redis layout, keep that split — see [Custom adapter](/duck-iam/integrations/adapters/custom#subject-store).

`revokeRole` without a scope removes every member whose decoded role matches, at any scope. With a scope it removes only that pair.

**`updateAssignmentScope` is not implemented here.** Scope is encoded into the member itself, so there is no cheaper "in place" path than remove plus add — exactly what the engine's fallback already does. `engine.admin.updateAssignmentScope` therefore issues `revokeRole` + `assignRole` against this adapter and succeeds normally. Since 5.5.0.

`IamAdapter.IAssignOptions` (`startsAt` / `expiresAt` / per-grant `attributes`) is likewise not implemented, and `assignRole` **throws** on those options rather than accepting the grant and dropping them — a break-glass grant issued with a one-hour expiry against an adapter that discards it is permanent. Grants in Redis never expire on their own and scoped roles from this adapter carry no `attributes`. Use the [Drizzle adapter](/duck-iam/integrations/adapters/drizzle#temporal-grants-and-per-grant-attributes) if you need either.

`assignRole` also refuses a role the hash does not hold, and refuses `scope: ''` and `scope: '*'` on a grant. The empty string is exactly how this encoding spells "no scope", so an empty scope would decode as a global grant; `'*'` is matched literally, so a grant stored there would answer only a request whose own scope is the string `"*"`. Both are accepted on a lookup, so an operator can still delete rows written before the guards existed.

## Multi-tenancy

`keyPrefix` is how you put more than one tenant on one Redis instance:

```ts
const tenant1 = new IamRedisAdapter({ client, keyPrefix: 'iam:tenant1:' })
const tenant2 = new IamRedisAdapter({ client, keyPrefix: 'iam:tenant2:' })

await tenant1.savePolicy({ id: 'p1', /* … */ })
await tenant2.getPolicy('p1') // null
```

Both adapters above share one connection and one Redis ACL. A prefix stops accidental collisions between tenants; it stops nothing that can issue commands on that connection, and a prefix derived from request data is a key-injection vector — build it from a validated tenant slug, never from raw user input. For real isolation use separate Redis ACL users, separate databases, or separate instances, and restrict write access to the store at the storage layer: the library trusts whatever the adapter returns and validates only its shape.

Sharing a Redis instance across tenants means sharing its pub/sub keyspace. The [Redis invalidator](/duck-iam/integrations/invalidators/redis) publishes on a single default channel, so tenant A's invalidate wipes tenant B's caches unless you pass `tenantId`, which prefixes the channel as `duck-iam:invalidate:tenant:${tenantId}`. Pair it with `secret`; unsigned, anyone with PUBLISH rights can flush the fleet.

## Row validation

`listPolicies`, `getPolicy`, `listRoles`, and `getRole` parse each stored blob and then run it through `parsePolicyRow` / `parseRoleRow` from `@gentleduck/iam/core/validate`. Every failure is reported through `onPolicyError` with `{ adapter: 'redis', rowId }` and the joined validator issues — but what happens next depends on which table it came from.

A bad **role** row is dropped and the rest of the hash is returned, because role permissions are allow-only: losing one can only cost a subject a grant. A bad **policy** row makes the read **throw**, and the engine denies until it is repaired, because a dropped policy may be the one that says NO. `getPolicy` on a corrupt row throws rather than returning `null`: `null` is the answer for a row that is not there, and a corrupt row must not be able to impersonate a deleted one.

A `__proto__` key inside a stored bag is refused rather than read past, and a row stored under the id `__proto__` is returned rather than dropped — verified against a real server, because that is where a client's own `out[field] = value` materialisation would invoke the inherited setter.

Subject attributes are the deliberate exception.

`getSubjectAttributes` throws `[@gentleduck/iam:redis] corrupted attributes for "<id>" (JSON parse failed)` or `… (not a JSON object)` when the stored string will not parse or parses to a non-object. Returning `{}` would silently strip every ABAC condition and flip decisions with no operator signal. The engine routes the throw through `onError`, fails closed with a deny, and records it on `onMetrics`. A missing key is still an ordinary `{}`. Since 2.1.0.

`setSubjectAttributes` is the one path that tolerates a failing read: it catches, reports through `onPolicyError`, and merges onto `{}` so an operator can always overwrite a broken key. The catch is **not** narrowed to the corrupt-blob case, though. When the `GET` fails transiently and the `SET` then succeeds, the stored bag is replaced by the patch alone and every key the patch does not name is gone. Pass an `onPolicyError` and treat a report from here as a write that may have truncated the bag, not as a logged curiosity.

It also guards its own argument — a non-object `attrs` throws `[@gentleduck/iam:redis] attributes for "<id>" must be a plain object (got string)` rather than spreading a string into per-character keys.

## Pairing with the engine cache

Redis costs a network hop per cache miss, so run it behind the engine's in-process LRU rather than in front of every check:

```ts
const engine = new IamEngine({
  adapter: new IamRedisAdapter({ client, keyPrefix: 'iam:' }),
  cacheTTL: 60,
  maxCacheSize: 10_000,
})
```

Hot reads never leave the process. After the TTL expires, or after an explicit invalidation, the next read hits Redis. In a multi-node deploy the piece you still need is a way to tell the *other* nodes that a policy changed — that is the [Redis invalidator](/duck-iam/integrations/invalidators/redis), which is a separate export from this adapter and can run on the same connection.

## When to use

* **Multi-instance deploys** where every node must see the same policy set without a database round trip per check.
* **Edge and serverless** runtimes: Upstash over REST, or any HTTP-shaped client wrapped to match `IamRedis.ILike`.
* **You already run Redis.** If you do not, a SQL adapter is fewer moving parts than a new stateful dependency.

Reach for something else when the store is large — everything here is resident in RAM, and a six-figure policy set with deep rule trees is a real memory cost that a relational adapter with indexes handles better — or when a single instance is enough, where `IamMemoryAdapter` is faster and free.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) for how the four stores fit together
* [Redis invalidator](/duck-iam/integrations/invalidators/redis) for the cross-node cache invalidation channel
* [Custom adapter](/duck-iam/integrations/adapters/custom) for the full interface contract and the compliance suite
* [Caching](/duck-iam/advanced/engine/caching) for what the engine keeps in process on top of this adapter
* [Memory adapter](/duck-iam/integrations/adapters/memory) for the single-instance alternative