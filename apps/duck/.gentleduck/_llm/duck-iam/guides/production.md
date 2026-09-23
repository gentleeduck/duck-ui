Everything here is operational: what to set, what it costs, and what breaks if you skip it. Single-node development setups can ignore it. Read it before mounting duck-iam in any deployment with more than one engine instance, a network adapter, a revocation SLA, or a latency SLO. The [pre-flight checklist](#pre-flight-checklist) at the bottom links every item back to the section or page that explains it.

The package ships a 10-section Deployment Hardening Guide in
[SECURITY.md](https://github.com/wildduck2/duck-iam/blob/main/packages/duck-iam/SECURITY.md)
covering identity sourcing, admin CSRF, Redis tenancy, cache
scoping, `defaultEffect: 'allow'`, `explain()` output trust, adapter trust,
file `rootDir`, HTTP `allowedHosts`, and observability wiring. This page is
the operational playbook; SECURITY.md is the threat model.

## A production topology

The shape most deployments converge on: several stateless engine instances, one shared policy store, one Redis for cross-instance invalidation, and metrics leaving through the hooks.

Each pod holds its own LRU caches, so a write through pod A's admin API is invisible to pods B and C until their TTL expires - unless the Redis bus is wired, which is what makes the topology correct rather than merely working. The store is the single source of truth; the pods are disposable. `/healthz` reflects one pod's view of the adapter, so an orchestrator can pull a pod whose adapter connection has gone bad without touching the others.

## Engine configuration reference

Every option that matters in production, with its real default.

| Option | Type | Default | What it does |
|---|---|---|---|
| `adapter` | `IamAdapter.IAdapter` | required | Storage for policies, roles, assignments, attributes |
| `mode` | `'development'` | `'production'` | `'development'` | Production returns plain booleans via the compiled table; development returns `IDecision` objects |
| `defaultEffect` | `'allow'` | `'deny'` | `'deny'` | Verdict when no rule matches |
| `allowFailOpen` | `boolean` | `false` | Explicit opt-in required to combine `defaultEffect: 'allow'` with any mode |
| `policyCombine` | `'and'` | `'allow-overrides'` | `'first-applicable'` | `'and'` | Cross-policy strategy |
| `cacheTTL` | `number` (seconds) | `60` | Lifetime of every cache entry. `0` disables caching |
| `maxCacheSize` | `number` | `1000` | Subject cache capacity |
| `maxPolicies` | `number` | `10_000` | Load-time cap; a larger adapter result throws |
| `maxRoles` | `number` | `10_000` | Same, for roles |
| `adapterTimeoutMs` | `number` | `5_000` | `AbortController` timeout per adapter read. `0` disables |
| `maxConcurrentSubjectLoads` | `number` | `512` | Cap on concurrent distinct-subject adapter loads; `0` restores unbounded |
| `invalidator` | `IInvalidator` | none | Cross-instance cache-invalidation broadcaster |
| `scopeMode` | `'flat'` | `'hierarchical'` | `'flat'` | Exact scope match, or dot-path ancestor match |
| `scopeCombine` | `'union'` | `'override'` | `'union'` | How multiple matching ancestor levels combine. Ignored under `'flat'` |
| `hooks` | `IHooks` | `{}` | `beforeEvaluate`, `afterEvaluate`, `onDeny`, `onError`, `onPolicyError`, `onMetrics`, `onMutation` |

`maxPolicies`, `maxRoles`, `adapterTimeoutMs`, and `maxConcurrentSubjectLoads` are all range-checked at construction and throw a `RangeError` on a non-finite or out-of-range value - a `NaN` limit would otherwise silently disable the bound, because `NaN > x` is always false. Full option reference: [engine configuration](/duck-iam/advanced/config).

## Set `mode: 'production'`

`mode` defaults to `'development'`. Development mode allocates a full `AccessControl.IDecision` per policy per request with a reason string, a duration, and a timestamp; production mode compiles roles and policies into a lookup table and returns a bare boolean.

```ts
const engine = access.createEngine({ adapter, mode: 'production' })
```

What changes in production mode:

* `check()` and `authorize()` return `boolean` instead of `IDecision`.
* `explain()` throws `explain() is not available in production mode`.
* `afterEvaluate` and `onDeny` never fire - they receive a `IDecision` that is never built. `onError`, `onPolicyError`, and `onMetrics` still fire.
* `policyCombine: 'first-applicable'` is refused at construction; the fast path cannot represent it.

See [development vs production mode](/duck-iam/advanced/engine/modes).

The compiled table addresses roles through a 32-bit grant mask. `compileTable()` throws when the role count exceeds 32 - role N and role N+32 would silently share a bit. The throw happens inside `authorize()`, so it is caught, routed to `onError`, and every request fails closed to deny. Count your roles before flipping the mode, and alert on `onError`. Deployments that legitimately need more roles must run `mode: 'development'`.

## Cache TTL trade-off

`cacheTTL` (seconds, default `60`) controls how stale a node's view of policies and roles can get.

* **Lower TTL** (`5` to `30` s) - quicker convergence after a revoke, more adapter load: every node re-fetches once per window.
* **Higher TTL** (`60` to `300` s) - fewer round-trips. A revoked permission can be honored for up to `cacheTTL` on a node that has the subject cached.
* **Zero TTL** - every check hits the adapter. Only sensible with `IamMemoryAdapter` or strong adapter-side caching.

For most deployments `cacheTTL: 30` plus a cross-instance invalidator is the right balance. There are five caches - policies, roles, the generated RBAC policy, the merged policy set, and subjects - and they all share the TTL. Only the subject cache is sized by `maxCacheSize`; the other four hold a single entry each. See [caching](/duck-iam/advanced/engine/caching).

## Multi-instance cache invalidation

Without a broadcaster, `engine.admin.savePolicy()` on pod A leaves pods B and C serving stale grants for up to `cacheTTL`. Wire `IConfig.invalidator` so every node drops its local caches the moment any node mutates state.

```ts
import { IamEngine } from '@gentleduck/iam'
import { createIamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'

const engine = new IamEngine({
  adapter,
  mode: 'production',
  cacheTTL: 30,
  invalidator: createIamRedisInvalidator({
    client: redisPubSub,
    secret: process.env.IAM_INVALIDATE_SECRET, // required in prod
    onPublishError: (err, channel) => sentry.captureException(err, { extra: { channel } }),
    onSubscribeError: (err, channel) => pager.fire('iam-invalidation-deaf', { channel, err }),
    onMessageDropped: (reason, _channel, suppressed) => drops.inc({ reason }, 1 + suppressed),
  }),
})

process.on('SIGTERM', () => engine.dispose())
```

The Redis helper:

* Embeds an instance UUID in every published event so a node never re-applies its own invalidate (no echo storm).
* Delivers at-least-once; `engine.cache.invalidate*()` is idempotent.
* Defaults to the channel `'duck-iam:invalidate'`.
* Signs each envelope with HMAC-SHA256 when `secret` is set - the signature covers the channel, so an envelope signed for one tenant is refused on another's - and drops anything unverified, outside a 30-second replay window, or over the 16 KiB pre-auth wire cap.
* Surfaces publish failures through `onPublishError` (a throw **or** a rejection), subscribe failures through `onSubscribeError`, and refused inbound messages through `onMessageDropped`. Without a hook, each falls back to a rate-limited `console.warn` - one per channel per kind per minute, with a coalesced suppressed count.

Every inbound `reason` is a fixed string from the module, safe as a metric label. The outbound `publish failed (<message>)` reason interpolates the driver's error text and is not; collapse it to a constant before labelling with it.

The invalidator never re-issues SUBSCRIBE. Once the first subscribe resolves the
latch stays set, so a `CLIENT KILL`, a failover, or a Redis restart leaves the
node deaf unless the client library resubscribes - ioredis and node-redis v4 do,
a hand-rolled client may not. Nothing in duck-iam notices either way, and
`engine.healthCheck()` never consults the invalidator: a permanently deaf
replica still answers `ok: true` while serving pre-revocation decisions for up
to one `cacheTTL`. Monitor `PUBSUB NUMSUB <channel>` and alert when it sits
below the replica count for longer than one `cacheTTL`. That is the only
external signal, and `onSubscribeError` is the only internal one.

`createIamRedisInvalidator` needs only `publish`, `subscribe`, and an optional `unsubscribe`. Both ioredis and node-redis v4+ satisfy that shape directly. Pass two clients - Redis requires a separate connection for a subscriber. Detail: [Redis invalidator](/duck-iam/integrations/invalidators/redis).

On a shared Redis instance, pass `tenantId` so the channel is auto-prefixed
as `duck-iam:invalidate:tenant:<tenantId>`. Tenant A's revoke must never
wipe tenant B's cache. The slug is validated against
`/^[A-Za-z0-9_-]{1,64}$/` to prevent pub/sub-pattern injection from an
attacker-controlled tenant identifier. Always pair with `secret` -
unsigned mode lets any party with PUBLISH rights wipe caches across the
fleet, and it warns once at construction rather than refusing.

Rotating `IAM_INVALIDATE_SECRET` is HMAC-key rotation: engines with mismatched secrets drop each other's messages in both directions, reported as `signature mismatch`. A half-finished *first* rollout is worse - the signing nodes report `unsigned message with secret configured` and the rest report `v:2 envelope received without secret configured`, and no cache converges for the length of the window. The consequence in both cases is a revoked grant that keeps working on every node until its own TTL retires it, with nothing thrown and no request errored. Coordinate the window, watch `onMessageDropped` while it is open, and finish rather than pause.

## Identity sourcing (never trust client headers)

Identity must come from a verified source: a cookie session, a JWT verified
by your auth middleware, or mTLS. Never accept a raw request header as the
subject ID - any unauthenticated client can spoof `X-User-Id: admin` with
one `curl`. Since 2.1.0:

* **Hono** `iamAccessMiddleware` / `iamGuard` read only `c.get('userId')`. No `x-user-id` fallback.
* **Next** `withIamAccess` requires `getUserId` and throws at construction when it is omitted.
* **Express** defaults to `req.user?.id`, **Nest** to `req.user?.id ?? req.user?.sub` - both populated by upstream auth.
* **Custom integrations** must extract identity from a trusted source before invoking the engine.

Where the subject ID comes from when you pair with duck-auth: [auth bridge](/duck-iam/guides/auth-bridge). Per-framework extractor options: [express](/duck-iam/integrations/server/express), [hono](/duck-iam/integrations/server/hono), [nest](/duck-iam/integrations/server/nest), [next](/duck-iam/integrations/server/next).

## Admin router hardening

Every admin router refuses to mount without an `authorize` callback - `iamAdminRouter`, `iamBindAdminRouter`, `createIamAdminHandlers`, and `createIamAdminOperations` all throw at construction, for example ``[@gentleduck/iam] createIamAdminHandlers requires an `authorize` callback.`` A stub that returns `true` defeats the point; wire it to your real admin check.

Admin mutation endpoints also run a `Sec-Fetch-Site` check by default. Browsers populate that header automatically; cross-site form posts are rejected with 403 while same-site and same-origin requests pass. Non-browser callers send no header and pass - they must be gated by bearer tokens or mTLS.

Cookie-authenticated admin UIs get CSRF protection with no operator action.
Pass `csrfCheck: false` only for server-to-server bearer-token or mTLS APIs
that intentionally post cross-site. For a stricter check, pass a predicate -
an `Origin` allowlist, for instance. Also wire `onAdminMutation` for the
audit trail; it is fire-and-forget and can never alter the response.
See the [admin API](/duck-iam/advanced/engine/admin).

## Fail-closed defaults

Production engines refuse three footguns at construction time:

* `mode: 'production'` with `policyCombine: 'first-applicable'` - the fast path cannot distinguish "rule fired" from "default applied". The constructor throws.
* `defaultEffect: 'allow'` without `allowFailOpen: true` - fail-open authorization. The constructor throws ``defaultEffect 'allow' is a fail-open footgun. Pass `allowFailOpen: true` to confirm intent.`` Even with the opt-in it logs a loud startup warning on every boot, so a log grep always finds a fail-open fleet.
* An adapter returning more rows than `maxPolicies` or `maxRoles` (defaults `10_000`) - the load throws when the cache is filled, which routes through `onError` to a fail-closed deny.

Subject-resolution errors, adapter timeouts, and per-policy evaluation errors all fail closed too. A thrown error is logged through `hooks.onError` / `hooks.onPolicyError` and the request denies. A single malformed policy row is treated as NotApplicable so the rest of the policy set still evaluates - `onPolicyError` is the only signal that a stored row is broken.

`allowFailOpen: true` exists to support carefully scoped allowlist policies
(an internal admin tool where every action *should* require an explicit
deny). In any deployment where the engine guards user-facing surfaces,
keep `defaultEffect: 'deny'` and let your policies grant explicitly. Wire
`onMetrics` and chart `failOpen` - any non-zero rate under
`defaultEffect: 'allow'` means a request landed with no applicable
policy and was allowed by fallback.

## Bounding the cold-start herd

`maxConcurrentSubjectLoads` (default `512`; `0` restores unbounded) caps how many distinct subjects can be loading from the adapter at once. A burst of never-before-cached subjects arriving faster than the adapter resolves them grows the in-flight map and the promise closures it holds without limit. Setting a cap makes a *new* subject load reject immediately once the cap is reached, before touching the adapter:

```ts
const engine = access.createEngine({ adapter, mode: 'production', maxConcurrentSubjectLoads: 256 })
```

The rejection message contains `subject load shed` and surfaces through the same fail-closed `catch` to `onError` path as any other resolution failure - no new wiring. A call that hits the subject cache, or joins an already-in-flight load for the same subject, never counts against the cap. This is load shedding, not a queue: shed requests deny rather than wait.

## Recommended hook set

Wire the hooks you need once at startup; an unwired hook costs nothing, and the mutation sink is not even allocated when `onMutation` is unset.

```ts
const engine = new IamEngine({
  adapter,
  mode: 'production',
  hooks: {
    onError: (err, req) => sentry.captureException(err, { extra: { req } }),
    onPolicyError: (err, policyId) => sentry.captureException(err, { extra: { policyId } }),
    onDeny: (req, decision) => auditLog.write({ kind: 'deny', req, decision }),
    onMetrics: (event) => metrics.record(event),
    afterEvaluate: (req, decision) => {
      if (process.env.NODE_ENV !== 'production') console.debug('iam', req.action, decision.allowed)
    },
  },
})
```

| Hook | Fires | Use it for |
|---|---|---|
| `beforeEvaluate` | before evaluation, may rewrite the request | Enrichment; pin `environment.now` for replay |
| `afterEvaluate` | after every evaluation, **development mode only** | Debug tracing. Skip in production mode - it never fires there |
| `onDeny` | on every deny, **development mode only** | Audit log. Required for SOC 2 / ISO 27001 |
| `onError` | adapter failures, timeouts, condition-tree throws | Page on rate. Every one of these is a denied request |
| `onPolicyError` | one malformed policy row | Page on rate. The only signal a stored row is rotten |
| `onMetrics` | once per evaluation, both modes | Latency and outcome telemetry |
| `onMutation` | after every `engine.admin` write lands, both modes | The audit seam for writes. A revocation hard-deletes the grant row, so this is the only record it happened. One event per row on a batch |

A hook that throws cannot change a decision. `afterEvaluate` and `onDeny` run outside the evaluation `try` block, and every hook call is individually wrapped, so an operator bug is routed to `console.error` rather than rewriting an allow into a deny. Signatures: [hooks](/duck-iam/advanced/engine/hooks).

`onDeny` receives an `IDecision` that production mode never allocates, so it
never fires there. Build the audit trail from `onMetrics` - the event carries
`subjectId`, `action`, `resource`, `allowed`, `durationMs`, `mode`, and
`failOpen` - or run the audited surface in development mode deliberately.

## Adapter timeout and HTTP adapter tuning

`adapterTimeoutMs` (default `5_000`) caps every adapter read. On timeout the engine aborts through an `AbortController` and rejects with `[@gentleduck/iam:engine] <label> timed out after <n>ms`, which routes through `onError` to a deny. Set it conservatively - a long timeout under load multiplies into queue depth. Adapters that honour `IReadOptions.signal` hard-cancel; the rest just stop being waited on.

For `IamHttpAdapter`:

```ts
import { IamHttpAdapter } from '@gentleduck/iam/adapters/http'

new IamHttpAdapter({
  baseUrl: process.env.IAM_API!,
  allowedHosts: ['iam.internal.example.com'], // SEC - see below
  timeoutMs: 2_000,           // per request, layered with the engine timeout
  retries: 2,                 // 3 total attempts; 4xx is never retried
  backoffMs: 100,             // exponential: 100 -> 200 -> 400, plus jitter
  circuitBreakerThreshold: 5, // open after 5 consecutive transient failures
  circuitBreakerCooldownMs: 30_000,
})
```

The circuit breaker is **closed** while traffic flows, **open** for `circuitBreakerCooldownMs` after the threshold is hit (rejecting immediately with `circuit open - refusing request`), then **half-open**, where one serialized probe is allowed - success closes it, failure re-opens it. A second concurrent probe is refused with `circuit half-open probe in flight`.

Without `allowedHosts` the adapter warns once at construction and accepts any
host in `baseUrl`. The defaults already reject private and loopback IP
literals and refuse to follow redirects (a 302 to a link-local metadata
endpoint was a real finding), but an explicit allowlist is the control that
survives a config change. Bare hostnames match any port; `host:port` entries
match that port only. See [HTTP adapter](/duck-iam/integrations/adapters/http).

For Prisma, Drizzle, and Redis adapters, configure retries in the driver (Prisma pool settings, ioredis `retryStrategy`). The engine timeout still applies on top. If you use the file adapter with any request-derived path, set `rootDir` - containment and symlink checks only run when it is set.

## Health check probe

```ts
app.get('/healthz', async (_, res) => {
  const h = await engine.healthCheck()
  res.status(h.ok ? 200 : 503).json(h)
})
```

Returns `IamEngineTypes.IHealth`:

```ts
{
  ok: boolean,            // false -> the orchestrator should pull this instance
  adapter: 'ok' | 'fail',
  cacheHitRate: number,   // 0..1, aggregate across all five caches; 0, not NaN, with no traffic
  adapterLatencyMs: number,
  lastError?: string,     // adapter error message when adapter === 'fail'
  compiledTable?: {       // present only when the table could not be built
    available: false
    reason: 'role-limit-exceeded'
    roleCount: number
    limit: number
  },
}
```

The probe runs one `listPolicies` under the configured `adapterTimeoutMs`, plus a compiled-table read. It never throws - a health endpoint that throws tells a load balancer nothing it can act on. Cheap enough to call every 5 to 10 seconds.

`compiledTable` present means the role count outran the 32-bit grant mask and this engine dropped to the interpreter. The flag is set once and never cleared, so it keeps reporting the count observed at the trip even after roles are deleted back under 32; recovering the compiled table means constructing a new engine.

What the probe does **not** cover is the invalidator. It reports `ok: true` on a replica that never subscribed. Pair `/healthz` with a `PUBSUB NUMSUB` check - see [multi-instance cache invalidation](#multi-instance-cache-invalidation).

## Metrics aggregation

Wire `iamCreateMetricsAggregator()` to `onMetrics` and expose its snapshot.

```ts
import { iamCreateMetricsAggregator } from '@gentleduck/iam/observability/metrics'

const metrics = iamCreateMetricsAggregator({ sampleSize: 1000 })
const engine = new IamEngine({ adapter, mode: 'production', hooks: { onMetrics: metrics.record } })

app.get('/metrics', (_, res) => res.json(metrics.snapshot()))
// -> { total, allow, deny, failOpen, p50, p95, p99, max, samples }
```

`sampleSize` must be a positive integer and defaults to `1000`; anything else throws `[@gentleduck/iam:metrics] sampleSize must be a positive integer`. The buffer is a fixed-size `Float64Array` ring - memory does not grow with traffic, and percentiles are computed over the most recent `sampleSize` durations. Push the snapshot into your Prometheus or OTel pipeline at your scrape interval.

`failOpen` counts allow verdicts that fired solely because the `defaultEffect: 'allow'` fallback matched with no applicable policy. Chart it to detect silent policy-set breakage - a broken adapter, a mass deletion, rules dropped by a ReDoS guard - that the boolean verdict alone hides. Under `defaultEffect: 'deny'` it stays at zero. Detail: [metrics aggregator](/duck-iam/integrations/observability/metrics).

For per-cache detail, `engine.stats.get()` returns `{ hits, misses, size }` for each of `policies`, `roles`, `rbacPolicy`, `mergedPolicies`, and `subjects`; `engine.stats.reset()` zeroes them.

## Cold-start warmup

Boot-time `engine.preload()` primes the merged policy cache so the first request after deploy does not pay the full load and index cost - the bench shows roughly a 15x speedup on that first call.

```ts
await engine.preload()
server.listen(PORT)
```

Pass `{ validator: true }` to also eagerly load the lazy 12 KB validator chunk, so an operator front-loads that cost at boot instead of paying it on the first admin write. Read-only services can leave it off.

## Shared cache flushing (multi-tenant)

`iamFlushSharedCaches()` wipes the process-wide compiled-regex cache (the `matches` operator) and the dot-path segment cache. Both are module globals shared across every engine instance in the process. In multi-tenant deployments, a hostile tenant flooding distinct `matches` patterns or dot-paths evicts neighbours' hot entries; a periodic flush bounds that influence.

```ts
import { iamFlushSharedCaches } from '@gentleduck/iam/core'

// Multi-tenant operators: flush every 5 minutes.
setInterval(() => iamFlushSharedCaches(), 5 * 60 * 1000)
```

The cost is that the next request from every tenant pays one regex compile per pattern and one segment split per dot-path. Tune the interval against your request volume and pattern variety. The stronger mitigation is one process per tenant, which removes the sharing entirely.

`clearPathCache()` is also exported if you only want to flush the dot-path cache. There is no public export for clearing the regex cache alone - use `iamFlushSharedCaches()`. See [utilities](/duck-iam/advanced/utilities).

## Snapshot policies and roles (environment promotion)

`engine.admin.export()` and `import()` round-trip schema-versioned configuration snapshots. Use them for staging-to-production promotion, GitOps-style policy review, disaster recovery, or git-tracked policy bundles.

```ts
// Export from staging
const snapshot = await stagingEngine.admin.export()
writeFileSync('iam-snapshot.json', JSON.stringify(snapshot, null, 2))

// Import to production
const result = await prodEngine.admin.import(JSON.parse(readFileSync('iam-snapshot.json', 'utf8')), {
  mode: 'replace',
})
// -> { policiesAdded, policiesDeleted, rolesAdded, rolesDeleted }
```

* `mode: 'merge'` (default) - upserts every snapshot entry and leaves existing rows alone.
* `mode: 'replace'` - first deletes every existing policy and role *not* in the snapshot, then upserts. Use for a full sync from a source of truth.

The snapshot carries `schemaVersion: 1` and `exportedAt`. `import()` validates the version before any write and throws `unsupported snapshot schemaVersion <n>; expected 1` on a mismatch - it never partially applies an unknown shape.

Subject assignments are **intentionally excluded**: they are user data, they vary per environment, and most adapters cannot enumerate subjects cheaply. Migrate assignments separately. See [admin API](/duck-iam/advanced/engine/admin).

## SLO targets

Published figures from `bun run bench` (vitest bench against five competing libraries, regenerated for 5.x against `mode: 'production'`):

| Path | Throughput |
|---|---|
| `evaluateFast()` raw, no engine wrapper | ~7.6 M ops/s |
| `engine.can()`, `mode: 'production'`, cache-warm | ~1.15 M ops/s |
| `engine.can()`, `mode: 'development'`, cache-warm | ~155 K ops/s |
| Adapter cold miss | adapter-bound |

Absolute numbers are machine-specific; the ratios are the point. Roughly 1.15 M ops/s is about 0.87 µs per check on one core - the network, the database, and serialization around it all cost more. Throughput does not degrade with catalog size, because the compiled table is an O(1) index lookup. What constrains scale is catalog *shape*: role count (hard cap 32 in production mode), very wide action x resource grids, and deeply nested hierarchical resource types.

Target a `engine.can()` p95 under 1 ms at sustained QPS. If you breach it:

1. Check `engine.stats.get()` for a cache hit rate below 95% - `cacheTTL` too low, or `maxCacheSize` too small for your subject cardinality.
2. Check `metrics.snapshot()` - is `max` far above `p99`? That is timeouts firing, not steady-state cost.
3. Check `healthCheck().adapterLatencyMs` - the adapter is the bottleneck. Tune the driver pool, or put a Redis cache in front.
4. Confirm `mode: 'production'` actually took effect. Development mode is roughly 7x slower on the same catalog.

Methodology and per-profile numbers: [benchmarks](/duck-iam/benchmarks).

## Pre-flight checklist

Each item links to the section or page that explains it.

* \[ ] [`mode: 'production'` set](/duck-iam/advanced/engine/modes) and the role catalog is at or under 32 roles
* \[ ] [`defaultEffect` left at `'deny'`](#fail-closed-defaults), or `allowFailOpen: true` justified in the PR
* \[ ] [`cacheTTL` tuned to the revocation SLA](#cache-ttl-trade-off)
* \[ ] [`IConfig.invalidator` wired](/duck-iam/integrations/invalidators/redis) if more than one instance
* \[ ] [Redis invalidator `secret` set, `tenantId` if multi-tenant, `onSubscribeError` and `onMessageDropped` wired](/duck-iam/integrations/invalidators/redis)
* \[ ] [Identity derived from a verified source](#identity-sourcing-never-trust-client-headers) - never an `x-user-id` header
* \[ ] [Admin routers mounted with a real `authorize` callback](/duck-iam/advanced/engine/admin), not a stub
* \[ ] [Admin CSRF default kept on](#admin-router-hardening); `csrfCheck: false` only for bearer or mTLS APIs
* \[ ] [`onError` and `onPolicyError` wired and paged on](/duck-iam/advanced/engine/hooks)
* \[ ] [`onMetrics` wired; the decision audit trail built from it in production mode](#recommended-hook-set), not from `onDeny`
* \[ ] [`onMutation` wired](#recommended-hook-set) if admin writes need an audit trail - a revocation hard-deletes the grant row
* \[ ] [`failOpen` charted](/duck-iam/integrations/observability/metrics), especially under `defaultEffect: 'allow'`
* \[ ] [`adapterTimeoutMs` at or below the upstream SLO](#adapter-timeout-and-http-adapter-tuning)
* \[ ] [HTTP adapter `allowedHosts` set and circuit breaker sized](/duck-iam/integrations/adapters/http)
* \[ ] [File adapter `rootDir` set](/duck-iam/integrations/adapters/file) if any path is request-derived
* \[ ] [`maxConcurrentSubjectLoads` set](#bounding-the-cold-start-herd) if cold-start bursts are possible
* \[ ] [`/healthz` returns `engine.healthCheck()`](#health-check-probe), and `PUBSUB NUMSUB <channel>` is monitored separately - the probe does not know whether this node is subscribed
* \[ ] [`/metrics` returns the aggregator snapshot](#metrics-aggregation)
* \[ ] [`engine.preload()` at startup](#cold-start-warmup) and `engine.dispose()` on shutdown
* \[ ] [`iamFlushSharedCaches()` scheduled](#shared-cache-flushing-multi-tenant) in shared-process multi-tenant deployments
* \[ ] [Policies and roles bounded under `maxPolicies` / `maxRoles`](#engine-configuration-reference)
* \[ ] [`validateRoles()` / `validatePolicy()` run at boot](/duck-iam/advanced/validation) against the live catalog
* \[ ] [Promotion path uses `admin.export()` / `import()`](#snapshot-policies-and-roles-environment-promotion), not hand-edited rows

## See also

* [Troubleshooting](/duck-iam/guides/troubleshooting) - the symptoms these settings prevent, and the error strings they produce
* [Quick start](/duck-iam/guides) - the setup this checklist hardens
* [Caching](/duck-iam/advanced/engine/caching) - what each of the five caches holds
* [Benchmarks](/duck-iam/benchmarks) - methodology behind the SLO table