`IamHttpAdapter` turns the fourteen adapter methods it implements into fourteen REST calls against a service you run. It moves *storage* behind a service boundary, not evaluation: the engine still resolves the subject and evaluates policies locally, it just fetches them over `fetch` instead of from a database. The adapter ships the SRE plumbing that implies — per-request timeout, exponential-backoff retry, a circuit breaker, response size caps, and construction-time SSRF validation of the base URL. The wire protocol below is the whole of what your server has to implement.

## Install

No dependencies beyond `fetch`.

```ts
import { IamHttpAdapter, iamHttpAdapter } from '@gentleduck/iam/adapters/http'
import type { IamHttp } from '@gentleduck/iam/adapters/http'
```

## Setup

```ts
import { IamEngine } from '@gentleduck/iam'
import { IamHttpAdapter } from '@gentleduck/iam/adapters/http'

const adapter = new IamHttpAdapter({
  baseUrl: 'https://iam.example.com/access',
  allowedHosts: ['iam.example.com'],
  headers: { Authorization: `Bearer ${process.env.IAM_SERVICE_TOKEN}` },
  timeoutMs: 2_000,
})

const engine = new IamEngine({ adapter })
```

`iamHttpAdapter(config)` is the same constructor behind a factory function.

## Options

`IamHttp.IConfig` is the single constructor argument.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `baseUrl` | `string` | required | Base URL of your IAM API. Validated at construction (see [Base URL validation](#base-url-validation)); a single trailing `/` is stripped. Every path below is appended to it verbatim. |
| `allowedHosts` | `string[]` | `undefined` | Host allowlist for `baseUrl`. Omitted, any host is accepted and a one-time `console.warn` fires. |
| `allowPrivateHosts` | `boolean` | `false` | Permits a `baseUrl` whose hostname is a private, loopback, or link-local IP literal. |
| `headers` | `Record

### The unscoped-roles contract

`GET /subjects/{id}/roles` must return **global (unscoped) role ids only**. Scoped assignments belong to `GET /subjects/{id}/scoped-roles`. The adapter forwards whatever your server returns and cannot enforce this — it is the one adapter where the contract lives on your side. A server that collapses both into one list gives every subject their scoped roles in *every* scope, so the same subject evaluates with more permissions here than under the memory, file, redis, drizzle, or prisma adapter. The JSDoc on `IamAdapter.ISubjectStore.getSubjectRoles` states it; the compliance suite's reference server implements it.

### Reference server

The package's own compliance test wires a minimal in-memory server the adapter is held against, and it is the clearest executable specification of the protocol. The routing it implements, verbatim in behaviour:

```ts
// GET /subjects/:id/roles  — unscoped only, deduplicated
json([...new Set(entries.filter((e) => e.scope == null).map((e) => e.role))])

// GET /subjects/:id/scoped-roles — scoped only
json(entries.filter((e) => e.scope != null).map((e) => ({ role: e.role, scope: e.scope })))

// POST /subjects/:id/roles — idempotent on (role, scope)
if (!entries.some((e) => e.role === roleId && e.scope === scope)) entries.push({ role: roleId, scope })

// DELETE /subjects/:id/roles/:roleId — no scope param means every scope
scope === null
  ? entries.filter((e) => e.role !== roleId)
  : entries.filter((e) => !(e.role === roleId && e.scope === scope))

// PATCH /subjects/:id/attributes — merge, never replace
attributes.set(subjectId, { ...(attributes.get(subjectId) ?? {}), ...body })

// GET /policies/:id and /roles/:id — 404 for a miss, never 200 with null
hit ? json(hit) : json({ error: 'not found' }, 404)
```

Note that it mounts under a path prefix (`baseUrl` ends in `/access`) and strips that prefix before routing — the adapter appends its paths to whatever `baseUrl` you give, so mounting the API at a subpath is supported.

`adminRouter` and friends cover part of the admin surface but not this contract: they lack the single-item lookups, the scoped-role read, and the subject-attribute endpoints. To serve `IamHttpAdapter`, implement the full set above or extend the admin router with what is missing. See [Server integrations](/duck-iam/integrations/server).

## Authentication

The adapter has no auth of its own — it merges whatever `headers` gives it into every request. Static headers for a fixed service token:

```ts
new IamHttpAdapter({
  baseUrl: process.env.IAM_API!,
  allowedHosts: ['iam.internal'],
  headers: { Authorization: `Bearer ${process.env.IAM_SERVICE_TOKEN}` },
})
```

A function for rotating credentials or per-request context. It is awaited before **every** request, including each retry attempt, so a token refreshed between attempts is picked up:

```ts
new IamHttpAdapter({
  baseUrl: process.env.IAM_API!,
  allowedHosts: ['iam.internal'],
  headers: async () => ({
    Authorization: `Bearer ${await getServiceToken()}`,
    'X-Request-Id': crypto.randomUUID(),
  }),
})
```

`Content-Type: application/json` is merged first and your `headers` last, so returning a `Content-Type` from your function overrides the default — do not, unless you mean to. There is deliberately no per-call header field: `HeadersInit` has three shapes, the merge handled one of them by spreading, and a `Headers` instance carrying `Authorization` spread to `{}` — the write went out unauthenticated with nothing to see.

For mTLS or a proxy, supply `fetch` instead and do the transport work there:

```ts
new IamHttpAdapter({
  baseUrl: process.env.IAM_API!,
  allowedHosts: ['iam.internal'],
  fetch: async (url, init) => {
    const started = Date.now()
    const res = await undiciFetch(url, { ...init, dispatcher: mtlsAgent })
    metrics.timing('iam.http', Date.now() - started, { status: String(res.status) })
    return res
  },
})
```

## Base URL validation

`baseUrl` is parsed and checked once, in the constructor. Each failure throws immediately rather than at first request.

| Condition | Error |
| --- | --- |
| Not parseable as a URL | `[@gentleduck/iam:http] invalid baseUrl "…"` |
| Scheme is not `http:` or `https:` | `[@gentleduck/iam:http] baseUrl scheme must be http: or https:, got …` |
| Contains a query string or fragment | `[@gentleduck/iam:http] baseUrl must not contain a query string or fragment` |
| Host not in a non-empty `allowedHosts` | `[@gentleduck/iam:http] baseUrl host "…" not in allowedHosts` |
| Private or loopback IP literal without `allowPrivateHosts` | `[@gentleduck/iam:http] baseUrl host "…" resolves to a private/loopback range - set allowPrivateHosts: true to opt in` |

`allowedHosts` matching is deliberate about its edges. Comparison is case-insensitive on both sides, a trailing FQDN dot is stripped, and internationalised names are punycoded through `new URL` before comparing. An entry may be a bare hostname or a `host:port` pair: a bare entry matches the hostname at any port, so `['example.com']` accepts `example.com`, `example.com:80`, and `example.com:8443`; a `host:port` entry matches only that exact port, so `example.com:8080` rejects both `example.com` and `example.com:9090`.

The private-host check covers IPv4 (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0/8`), IPv6 (`::1`, `::`, `fc00::/7`, `fe80::/10`), and the tunnelling forms that smuggle an IPv4 address inside an IPv6 literal — IPv4-mapped (`::ffff:127.0.0.1` and its hex spelling `::ffff:7f00:1`), IPv4-compatible (`::127.0.0.1`), 6to4 (`2002:7f00:1::`), and NAT64 (`64:ff9b::127.0.0.1`). DNS names are never resolved, because that would need synchronous I/O at construction; constrain those with `allowedHosts`.

Every request is issued with `redirect: 'error'`. Before 2.1.0 the adapter followed redirects, so a `302` to `169.254.169.254` or an internal host bypassed the construction-time validation entirely — the guard ran once on `baseUrl` and never again. If your API legitimately redirects, point `baseUrl` at the final location.

Omitting it accepts any host and fires a one-time process-wide `console.warn`. It is defence in depth: if `baseUrl` is ever built from configuration an attacker can influence, the allowlist is what stops the adapter shipping your service token to their endpoint.

## Errors, retries, and the circuit breaker

### Response handling

A non-2xx response throws `[@gentleduck/iam:http] HTTP 

**Closed** passes traffic. Each request that ends in a thrown error increments a consecutive-failure counter; any response at all — 2xx or 4xx — resets it to zero. At `circuitBreakerThreshold` the circuit opens.

**Open** rejects immediately with `[@gentleduck/iam:http] circuit open - refusing request`, without a fetch attempt, for `circuitBreakerCooldownMs`.

**Half-open** begins when the cooldown elapses. Exactly one probe is allowed through; concurrent callers reject fast with `[@gentleduck/iam:http] circuit half-open probe in flight` so a recovering upstream is not flooded the instant it comes back. The probe's outcome closes the circuit or re-opens it for another cooldown.

Breaker state is per adapter instance, not per process. It cannot be disabled by configuration - `0` is rejected at construction - so raise the threshold above any burst you expect instead.

### Timeouts

Two timeouts stack. The adapter's own `timeoutMs` aborts the fetch with a transient error (so it is retried); the engine's `adapterTimeoutMs` aborts the whole adapter call (so it is not). Whichever fires first wins, and `IReadOptions.signal` from the engine is composed with the per-request timer, so an invalidation that supersedes an in-flight load cancels the HTTP request for real rather than leaving it running. This is one of the few adapters that honours the signal end to end. Set `timeoutMs: 0` to rely solely on the engine's.

## Input and response guards

The adapter refuses obviously bad input before it reaches the wire, and refuses obviously bad output before it reaches the engine.

| Situation | Result |
| --- | --- |
| Any id that is empty, non-string, contains `/` or `\`, is all dots, or is over 1024 characters | **throws**, no request issued. Reads and writes share one guard, so a write cannot store an id a read could never fetch back. It used to return `null`, `[]` or `{}` instead; the `{}` was the sharp end, because a rule denying on `attributes.suspended === true` then evaluated as though the attribute were absent - a guard meant to bound a URL was quietly retiring deny rules. |
| `assignRole` with `scope: ''` or `scope: '*'`, or with `startsAt` / `expiresAt` / `attributes` | throws, naming the option; this adapter stores none of them |
| `setSubjectAttributes` with a non-object `attrs` | throws `[@gentleduck/iam:http] attributes for "<id>" must be a plain object (got string)` |
| `GET /policies` or `/roles` returns a non-array | reported through `onPolicyError` with `rowId` set to the path, treated as `[]` |
| A **policy** row fails `parsePolicyRow` | reported, then the whole read **throws** - a dropped policy may be the one that denies |
| A **role** row fails `parseRoleRow` | dropped and reported; the rest of the catalog is returned. The row's own `id` is used as the `rowId` when present, else `"/roles[3]"` |
| `GET /subjects/{id}/roles` returns a non-array | throws `[@gentleduck/iam:http] getSubjectRoles for "<id>" returned object (expected JSON array)` |
| An entry in it is not a non-empty string | silently skipped |
| `GET /subjects/{id}/scoped-roles` returns a non-array | throws the equivalent `getSubjectScopedRoles` message |
| An entry lacks a non-empty string `role` **and** `scope` | silently skipped — a scoped role with no scope is not a global grant |
| `GET /subjects/{id}/attributes` returns an array, `null`, or a scalar | throws `[@gentleduck/iam:http] getSubjectAttributes for "<id>" returned array (expected JSON object)` |

The asymmetry is deliberate and matches the other adapters. A bad *role* row is dropped, because role permissions are allow-only and losing one can only cost a subject a grant. A bad *policy* row and bad *subject* data both throw, because silently returning `[]` or `{}` would strip a deny rule and change decisions with no signal. See the same rule in a different store on the [Redis](/duck-iam/integrations/adapters/redis#row-validation) and [Prisma](/duck-iam/integrations/adapters/prisma#row-validation) pages.

## Gotchas

* **Evaluation stays local.** This adapter fetches authorization *data*; the engine still resolves subjects and evaluates policies in your process. It is not a remote-decision adapter. To evaluate on the server and consume the result on a client, expose `engine.permissions()` and use the [client integrations](/duck-iam/integrations/client) instead.
* **Every cold read is a round trip.** Pair it with the engine's LRU (`cacheTTL`, `maxCacheSize`), and use the [Redis invalidator](/duck-iam/integrations/invalidators/redis) rather than a short TTL if you need fresh reads across nodes.
* **`headers` runs on every attempt.** A slow token fetch is inside your `timeoutMs` budget.
* **The breaker is per instance.** Constructing an adapter per request gives you no breaker at all, and re-fires the missing-`allowedHosts` warning check on a process-wide latch. Construct it once.
* **`PUT` sends the whole object.** There is no partial update for policies or roles; the body is the full `IPolicy` or `IRole`, and your server upserts on its `id`.
* **A `DELETE` of an unknown id must succeed.** The interface expects idempotent deletes, and the adapter turns a `404` on those paths into a thrown error.
* **Your server owns two guarantees the adapter cannot enforce:** `DELETE /roles/{id}` cascades to the grants, and `POST /subjects/{id}/roles` refuses a role it does not hold. Both are contract; the adapter only surfaces the non-2xx as a throw.
* **The numeric options throw at construction.** `retries: Number(process.env.X)` on an unset variable is `NaN`, and `NaN` used to mean no request was issued at all.

## See also

* [Adapters overview](/duck-iam/integrations/adapters) for how the four stores fit together
* [Custom adapter](/duck-iam/integrations/adapters/custom) for the interface this protocol implements, and the compliance suite that pins it
* [Server integrations](/duck-iam/integrations/server) for the admin router this protocol partly overlaps
* [Client integrations](/duck-iam/integrations/client) for the permission-map path, which is the remote-evaluation alternative
* [Caching](/duck-iam/advanced/engine/caching) for what the engine keeps in process on top of this adapter