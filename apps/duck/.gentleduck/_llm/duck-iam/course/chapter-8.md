DocDuck works. It also stores every policy in a JavaScript object that vanishes on restart, runs one process, and reports nothing. This last chapter takes it to production: a database-backed adapter, production mode, cache invalidation across instances, metrics, and a health probe.

## What you should already have

`src/roles.ts`, `src/policies.ts`, `src/documents.ts`, `src/access.ts` (adapter, hooks, engine), `src/server.ts` from chapter 6, and a client from chapter 7. Everything below edits `src/access.ts` and adds two routes to `src/server.ts`.

## Learning goals

* Swap the memory adapter for a persistent one without touching a policy.
* Understand what production mode changes and what it costs you.
* Keep caches correct across multiple instances.
* Emit latency and allow/deny metrics, and expose a health probe.
* Run through the pre-deploy checklist.

## What a production deployment looks like

Each instance keeps its own caches and reads through to the same database on a miss. When one instance writes a policy through the admin API, it broadcasts an invalidation over Redis so the others drop their stale copies instead of serving them until their TTL expires.

## Step 1: a persistent adapter

The engine talks to an `IamAdapter.IAdapter` - policy store, role store, subject store. Every adapter implements the same interface, so swapping one is a single-line change and no policy or role definition moves.

```ts title="src/access.ts"
import { PrismaClient } from '@prisma/client'
import { IamPrismaAdapter } from '@gentleduck/iam/adapters/prisma'

const prisma = new PrismaClient()
const adapter = new IamPrismaAdapter(prisma)
```

The Prisma adapter expects four models - `accessPolicy`, `accessRole`, `accessAssignment`, `accessSubjectAttr`. The adapters page lists the schema; `IamDrizzleAdapter`, `IamRedisAdapter`, `IamFileAdapter` and `IamHttpAdapter` cover the other shapes, and `IamAdapter.IAdapter` is the contract if you write your own.

Two things follow from persistence:

* **`IamMemory.IInit.assignments` is gone.** The seed block from chapter 5 becomes a migration or a seed script that writes rows once, not a promise your app awaits at boot.
* **Every read is now I/O.** `adapterTimeoutMs` (default `5000`) bounds it; an over-budget read aborts and the check fails closed rather than hanging the request.

## Step 2: production mode

```ts title="src/access.ts"
export const engine = new IamEngine({
  adapter,
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  scopeMode: 'hierarchical',
  cacheTTL: 60,
  maxCacheSize: 5_000,
  adapterTimeoutMs: 3_000,
  maxConcurrentSubjectLoads: 200,
  hooks, // beforeEvaluate, onDeny, onError, onMetrics - unchanged since chapter 4
})
```

| Option | Default | What it does |
| --- | --- | --- |
| `mode` | `'production'` | `'production'` evaluates against a compiled table and returns plain booleans; set `'development'` explicitly to get decisions and `explain()` back |
| `cacheTTL` | `60` | cache lifetime in **seconds**; `0` disables caching entirely |
| `maxCacheSize` | `1000` | subject cache entry ceiling |
| `adapterTimeoutMs` | `5000` | per-adapter-call timeout; `0` disables |
| `maxPolicies` / `maxRoles` | `10000` | hard ceilings; an over-cap load throws once per cache fill |
| `maxConcurrentSubjectLoads` | `512` | caps concurrent distinct-subject loads; over the cap a new subject load sheds with an error instead of calling the adapter. `0` restores unbounded |
| `defaultEffect` | `'deny'` | leave it |

What production mode changes:

* `check()` and `permissions()` return plain booleans instead of decision objects. `can()` returns `boolean` in both modes, so guards and middleware are unaffected.
* `explain()` **throws** - `explain() is not available in production mode`. Keep a staging deployment in development mode for debugging.
* Evaluation runs against a compiled lookup table plus a role bitmask, rebuilt lazily and guarded by a generation counter so a concurrent invalidation cannot install a stale table.

Two configurations the constructor refuses outright, both at construction rather than at request time:

* `mode: 'production'` with `policyCombine: 'first-applicable'` - the fast path cannot represent it.
* `defaultEffect: 'allow'` without `allowFailOpen: true` - fail-open is a footgun. Even with the opt-in the engine logs a loud startup warning, on purpose.

## Step 3: invalidation across instances

With one process, `engine.cache.invalidatePolicies()` after an admin write is enough. With several, instance B keeps serving its cached copy until the TTL lapses. Wire a broadcaster:

```ts title="src/access.ts"
import { createIamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'

const invalidator = createIamRedisInvalidator({
  client: { publish: (ch, msg) => pub.publish(ch, msg), subscribe: (ch, h) => sub.subscribe(ch, h) },
  secret: process.env.IAM_INVALIDATE_SECRET,
  tenantId: process.env.TENANT_SLUG,
  onPublishError: (err, channel) => alerting.warn('iam invalidate publish failed', { err, channel }),
})

export const engine = new IamEngine({ adapter, invalidator /* ...the rest */ })
```

Without `secret`, envelopes are unsigned and **anyone with PUBLISH rights on the channel can wipe every instance's caches** - a cheap denial-of-service against your database. The invalidator warns once at construction when you omit it. With a secret, each envelope is signed `HMAC-SHA256(secret, canonicalJSON(payload))`, unverified envelopes are dropped, and a replay window bounds how long a captured envelope stays usable.

`tenantId` is the multi-tenant shortcut: it appends `:tenant:

None of your policies, roles, or checks changed in this chapter. Only what surrounds them did - where the data lives, how stale it can get, and how you find out when it breaks. That is the point of the adapter interface.

The failure direction is consistent throughout. An adapter timeout, a shed subject load, a policy-load error, an over-cap read: all of them deny, fire `onError`, and answer 403. The only way to get an allow is for a rule to actually fire.

## Pre-deploy checklist

Engine configuration

* `mode: 'production'` in production, `'development'` in staging so `explain()` still works.
* `defaultEffect` left at `'deny'`. If it is `'allow'`, you passed `allowFailOpen: true` deliberately and you monitor `failOpen`.
* `adapterTimeoutMs` set below your HTTP request budget.
* `maxConcurrentSubjectLoads` set if a cold start can see a burst of distinct users.
* `engine.preload()` awaited before the process accepts traffic.
* `engine.dispose()` wired to your shutdown handler.

Storage and invalidation

* A persistent adapter, with its migrations applied.
* `cacheTTL` chosen against how quickly a revoke must take effect.
* An invalidator wired if more than one instance runs.
* `secret` set on the invalidator, from an environment variable.
* `tenantId` set per tenant on a shared Redis instance.
* `onPublishError` routed to alerting.

Server surface

* Authentication runs before every guard; no identity comes from a client-set header.
* The admin router's `authorize` checks a real platform-admin capability, and the mount point is rate-limited.
* CSRF left on, or replaced with an explicit Origin allowlist.
* `onAdminMutation` writing to an audit sink, with `redactPath` if that sink is outside your trust boundary.
* `/healthz` and `/metrics` mounted, and not publicly reachable.

Client

* Every UI gate has a matching server-side check.
* The permission map is refetched on login, on tenant switch, and after role changes.
* The batch stays well under the 1024-entry cap.
* No policy, role, or adapter code imported into browser bundles.

## Try it

1. Point DocDuck at Postgres through `IamPrismaAdapter`, restart the process, and confirm Bob's scoped roles survive the restart.
2. Set `mode: 'production'` and call `engine.explain(...)`. Confirm it throws, then confirm `engine.can(...)` still returns the same booleans as in development.
3. Construct an engine with `defaultEffect: 'allow'` and no `allowFailOpen`. Read the error - that is the guard rail working.
4. Run two instances against one database, change a policy through the admin router on instance A with an invalidator wired, and confirm instance B sees the new decision immediately. Remove the invalidator and watch it lag by `cacheTTL`.
5. Hit `/metrics` after some traffic and check that `failOpen` is `0` and the `subjects` cache hit rate is high. Drop `maxCacheSize` to `2` and watch it collapse.
6. Stop the database and hit `/healthz`. Confirm `ok: false`, `adapter: 'fail'`, and a populated `lastError`, and that checks deny rather than hang.

## See also

* [Production guide](/duck-iam/guides/production) - the operational reference this chapter condenses
* [Engine modes](/duck-iam/advanced/engine/modes) - what production mode compiles and what it gives up
* [Caching](/duck-iam/advanced/engine/caching) - the five caches, TTLs, and invalidation semantics
* [Redis invalidator](/duck-iam/integrations/invalidators/redis) - envelope format, signing, replay window
* [Metrics](/duck-iam/integrations/observability/metrics) - snapshot fields and exporter wiring
* [Adapters](/duck-iam/integrations/adapters) and [Prisma adapter](/duck-iam/integrations/adapters/prisma) - schemas and trade-offs
* [Validation](/duck-iam/advanced/validation) - every issue code
* [Troubleshooting](/duck-iam/guides/troubleshooting) - symptoms to causes