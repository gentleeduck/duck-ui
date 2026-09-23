`createIamRedisInvalidator` connects a duck-iam engine to a Redis pub/sub channel so that every process in a fleet drops the right local caches when *any* process mutates a policy, role, or subject. This page documents the channel naming, the exact bytes on the wire, what happens when a message is dropped or the connection breaks, and every failure mode the implementation defends against.

## Why cross-process invalidation is needed

The engine caches aggressively. Five LRU caches (policies, roles, the RBAC-derived policy, merged policies, and resolved subjects) sit in front of the adapter, each entry living for `cacheTTL` seconds - default `60`. That is what makes a `can()` check a memory lookup instead of a database round-trip.

Those caches are per-process. `engine.admin.savePolicy()` on pod A writes through the adapter and clears pod A's caches, but pods B through J know nothing about it. Until their own entries expire they keep answering from the pre-mutation snapshot.

A revoke is the dangerous direction. `engine.admin.revokeRole('u-1', 'admin')` on pod A takes effect on pod A immediately; on every other pod the subject keeps the role for up to `cacheTTL` seconds. With the default `cacheTTL: 60` that is a full minute of a revoked administrator still passing `can()` on nine out of ten pods.

An invalidator closes that window. Every local invalidation is also broadcast; every process subscribed to the same channel applies the matching local invalidation. Propagation is one Redis round-trip instead of one TTL.

The contract itself is transport-agnostic - `IamEngineTypes.IInvalidator` is two methods, `publish` and `subscribe`. The Redis implementation is the one shipped in the box; see [Custom transports](#custom-transports) for NATS, Kafka, or an in-process bus.

## Setup

The invalidator has no runtime dependencies of its own. It talks to whatever client you already use, through a three-method structural interface - one of them optional - that both ioredis and node-redis v4+ satisfy.

Open two Redis connections

Redis puts a connection into subscriber mode when it subscribes, and a subscribed connection cannot issue `PUBLISH`. You need one connection for each direction.

Adapt the client to `IamRedisInvalidator.IPubSubLike`

The invalidator calls `publish(channel, message)`, `subscribe(channel, handler)`, and optionally `unsubscribe(channel)`. Nothing else.

Pass the invalidator into the engine config

The engine subscribes once at construction and releases the subscription in `dispose()`.

```ts
import { IamEngine } from '@gentleduck/iam'
import { createIamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'
import Redis from 'ioredis'

const pub = new Redis()
const sub = new Redis() // subscriber must be a separate connection

const invalidator = createIamRedisInvalidator({
  client: {
    publish: (ch, msg) => pub.publish(ch, msg),
    subscribe: async (ch, handler) => {
      sub.on('message', (chan, message) => {
        if (chan === ch) handler(message)
      })
      await sub.subscribe(ch)
    },
    unsubscribe: (ch) => sub.unsubscribe(ch),
  },
  secret: process.env.IAM_INVALIDATE_SECRET, // required in production
  onSubscribeError: (err, channel) => alerts.page('iam-invalidation-deaf', { channel, err }),
})

const engine = new IamEngine({ adapter, invalidator })

process.on('SIGTERM', () => engine.dispose())
```

`await sub.subscribe(ch)` is load-bearing. The invalidator awaits whatever `subscribe` returns and only latches `subscribed` once it resolves, so awaiting is what makes a NOAUTH or a bad ACL reach `onSubscribeError` instead of vanishing into an unobserved promise.

For node-redis v4+ the adapter is thinner, because its `subscribe` already takes a per-channel listener:

```ts
import { createClient } from 'redis'

const pub = createClient()
const sub = pub.duplicate()
await Promise.all([pub.connect(), sub.connect()])

const invalidator = createIamRedisInvalidator({
  client: {
    publish: (ch, msg) => pub.publish(ch, msg),
    subscribe: (ch, handler) => sub.subscribe(ch, handler),
    unsubscribe: (ch) => sub.unsubscribe(ch),
  },
  secret: process.env.IAM_INVALIDATE_SECRET,
})
```

`IConfig.invalidator` is constructor-only, and engines are commonly built at module import time - before any replica-specific Redis client exists. `engine.setInvalidator(invalidator)` attaches one later, and `setInvalidator(null)` detaches; both validate the argument and throw a `TypeError` on anything that is not `null` or an object with `publish` and `subscribe` functions. Replacing unsubscribes the previous one first, so an engine holds at most one subscription however many times it is called. The constructor field routes through the same method.

Without `secret`, envelopes are unsigned and accepted from anyone holding PUBLISH rights on the channel - a shared Redis instance becomes a fleet-wide cache-wipe primitive. With `secret`, every envelope is HMAC-SHA256 signed and unverifiable envelopes are dropped. A `console.warn` fires at construction when no secret is set, latched per full channel name so one process running one invalidator per tenant reports each unsigned channel rather than only the first.

Roll the secret out to every replica at once. A fleet where half the nodes sign and half do not refuses envelopes in both directions for the whole rollout, and the failure is stale *allow* - see [failure modes](#failure-modes).

## Channels

One channel is one invalidation broadcast group. Every engine subscribed to it shares invalidations; engines on different channels are fully isolated.

| Config | Effective channel |
| --- | --- |
| neither `channel` nor `tenantId` | `duck-iam:invalidate` |
| `channel: 'iam:invalidate'` | `iam:invalidate` |
| `tenantId: 'acme'` | `duck-iam:invalidate:tenant:acme` |
| `channel: 'iam:invalidate'` + `tenantId: 'acme'` | `iam:invalidate:tenant:acme` |

The channel name is resolved once at construction and used for `publish`, `subscribe`, `unsubscribe`, and the `channel` argument handed to `onPublishError`, `onSubscribeError`, and `onMessageDropped`. It never changes for the lifetime of the invalidator.

### Per-tenant channels

On a shared Redis instance, tenants must not cross-invalidate: tenant A's mass revoke should not wipe tenant B's caches, and tenant A should not be able to observe tenant B's mutation rate. Pass `tenantId` and the invalidator builds the namespaced channel for you.

```ts
createIamRedisInvalidator({
  client,
  secret: process.env.IAM_INVALIDATE_SECRET,
  tenantId: req.tenantSlug, // validated against /^[A-Za-z0-9_-]{1,64}$/
})
```

`tenantId` is shape-validated against `/^[A-Za-z0-9_-]{1,64}$/`. A slug containing a space, a `*`, or an empty string throws at construction:

```
[@gentleduck/iam:invalidator:redis] tenantId must match /^[A-Za-z0-9_-]{1,64}$/ (got "wild*card")
```

The validation exists because tenant slugs are frequently attacker-influenced. An unvalidated slug could inject pub/sub glob characters or whitespace and cause a subscriber to match channels it was never meant to see. `redis-invalidator.test.ts` pins both halves: `tenantId: 'acme'` produces `duck-iam:invalidate:tenant:acme` on both the subscribe and publish paths, and `'with space'`, `'wild*card'`, and `''` all throw.

Building the channel name yourself with `channel` still works for existing deployments, but `tenantId` is the path for new code - it is the option that makes the isolation a checked invariant rather than a convention.

Everywhere this module *logs* a channel it replaces the tenant segment with the first eight hex digits of its SHA-256, so stderr does not become a directory of which tenants exist and which are being probed - the drop warning in particular is written on a path any outsider with PUBLISH rights can drive. The base channel stays readable, and the digest is unsalted so the same tenant reads identically across replicas. The three hooks receive the **raw** channel, tenant id included; they are your code, so you decide what reaches a shared sink.

## Message format

Three wire formats exist. Which one the invalidator writes is decided by `secret`; which ones it accepts is decided by the same value plus `acceptLegacyUnboundEnvelopes`.

### Signed envelope, v2 (`secret` set)

```json
{
  "payload": {
    "channel": "duck-iam:invalidate:tenant:acme",
    "event": { "kind": "subject", "subjectId": "u-1" },
    "instanceId": "0d3f1b9c-7a42-4a1e-9d6b-2e5c0f8a1234",
    "ts": 1764700000000
  },
  "sig": "5f3c9a1e8b7d4c2a0f6e9d8c7b6a5948372615049382716f5e4d3c2b1a0f9e8d",
  "v": 2
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `v` | `2` | Wire-format version. Bumped only on an incompatible envelope change. |
| `sig` | `string` (hex) | `HMAC-SHA256(secret, canonicalJSON(payload))`, lower-case hex. |
| `payload.channel` | `string` | The effective channel this envelope was signed for. Compared with the channel it arrived on. |
| `payload.event` | `IamEngineTypes.IInvalidateEvent` | The invalidation to apply. |
| `payload.instanceId` | `string` | UUID generated once per invalidator instance. Drives self-echo filtering. |
| `payload.ts` | `number` | `Date.now()` at publish time. Drives the replay window. |

**Why the channel is inside the signature.** v1's pre-image was `{event, instanceId, ts}`. A signature over that says only "someone holding the secret wrote this" - and on a shared fleet secret, that is every tenant. An envelope validly signed for tenant A therefore verified on tenant B's channel byte for byte, and was honoured. Channel routing decides who Redis *delivers* to; it says nothing about what a node accepts from someone publishing to its channel directly. v2 signs the channel and the verifier compares it with the channel the message arrived on.

The HMAC pre-image is **not** the bytes on the wire - it is `canonicalJSON(payload)`, a serialisation with object keys sorted lexicographically at every level and array order preserved. Publisher and verifier therefore agree byte-for-byte regardless of how either host's JSON engine orders keys. For the envelope above the pre-image is:

```json
{"channel":"duck-iam:invalidate:tenant:acme","event":{"kind":"subject","subjectId":"u-1"},"instanceId":"0d3f1b9c-7a42-4a1e-9d6b-2e5c0f8a1234","ts":1764700000000}
```

The payload is signed *after* a JSON round-trip, not as the in-memory object. `canonicalJSON` walking the live value emitted the literal token `undefined` for a property `JSON.stringify` drops outright, so the two sides hashed different byte strings and the signature could never match. `cache.invalidateRoles()` with no argument publishes exactly that shape - `{kind:'roles', roleId: undefined}` - so a blanket role revoke stopped propagating the moment signing was enabled. Round-tripping first also covers `Date`, `toJSON`, functions, symbols and array holes without enumerating them.

Signature comparison goes through `timingSafeEqual` from `node:crypto`, with a length pre-check so a mismatched-length signature cannot short-circuit the compare and leak a length oracle. A test reads the source and asserts the `timingSafeEqual` import is still there, specifically to stop a future refactor from reintroducing `===`.

### Signed envelope, v1 (legacy, channel-unbound)

The same shape without `payload.channel`. Refused by default. `acceptLegacyUnboundEnvelopes: true` accepts it, and re-opens exactly the cross-tenant hole described above - knowingly, for the middle of a rolling upgrade, where a v1 node's invalidations would otherwise be dropped and a dropped invalidation is a cache honouring a revoked grant until its TTL. It warns once per channel at construction while it is on, and the warning is gated on a `secret` being set: with no secret there is no signature to unbind and the flag changes nothing. Turn it off once every node publishes v2.

### Legacy unsigned envelope (`secret` omitted or `null`)

```json
{ "event": { "kind": "all" }, "instanceId": "0d3f1b9c-7a42-4a1e-9d6b-2e5c0f8a1234" }
```

No signature, no timestamp, no version field. Accepted only when the receiver has no secret configured.

### The event union

```ts
type IInvalidateEvent<TRole extends string = string> =
  | { readonly kind: 'all' }
  | { readonly kind: 'policies' }
  | { readonly kind: 'roles'; readonly roleId?: TRole }
  | { readonly kind: 'subject'; readonly subjectId: string }
```

Each admin mutation maps to exactly one event kind:

| Admin call | Local invalidation | Broadcast event |
| --- | --- | --- |
| `savePolicy`, `deletePolicy` | `cache.invalidatePolicies()` | `{ kind: 'policies' }` |
| `saveRole(role)` | `cache.invalidateRoles(role.id)` | `{ kind: 'roles', roleId }` |
| `deleteRole(id)` | `cache.invalidateRoles(id)` | `{ kind: 'roles', roleId }` |
| `assignRole`, `revokeRole`, `updateAssignmentScope`, `setAttributes` | `cache.invalidateSubject(subjectId)` | `{ kind: 'subject', subjectId }` |
| `import(snapshot)` | `invalidatePolicies()` then `invalidateRoles()` | two events: `policies`, then `roles` with no `roleId` |
| `engine.cache.invalidate()` | everything | `{ kind: 'all' }` |

Note that `roleId` is optional on the `roles` event and its absence is meaningful, not a defect: a `roles` event without a `roleId` clears the whole subject cache, while one carrying a `roleId` only evicts subjects that actually hold that role (globally or as a scoped role). `redis-invalidator-event-shape.test.ts` pins that `{ kind: 'roles' }` is accepted as-is.

Every other shape is rejected before it reaches a handler. `{ kind: 'subject' }` with a missing, non-string, or empty `subjectId`, `{ kind: 'roles', roleId: 42 }`, `{ kind: 'unknown' }`, and `{}` are all dropped. This is deliberate: an invalidate event with an `undefined` `subjectId` would be a no-op that looks like success, and a tampered payload must never be able to steer which cache entry gets cleared.

## Propagating a role change

This is the full path of a revoke on node A becoming a cache eviction on node B.

Three details in that sequence are load-bearing.

**The local invalidation happens first.** `cache.invalidateSubject` clears node A's own caches and *then* calls `invalidator.publish`. Node A is already correct before the broadcast leaves the process, which is why a publish failure is survivable.

**Node A ignores its own message.** Redis delivers a published message to every subscriber on the channel, including the publisher's own subscriber connection. Without the `instanceId` filter, every local mutation would echo back and clear caches the process had already rebuilt - under write load that becomes an invalidation storm. The subscriber compares `payload.instanceId` against its own per-process UUID and returns early on a match. `redis-invalidator.test.ts` loops a published message straight back to its own bus and asserts no handler fires.

**Node B applies with `broadcast: false`.** `applyInvalidateEvent` dispatches to the same `invalidate*` functions the local path uses, but with broadcasting suppressed. Without that, B would re-publish what it just received, C would re-publish B's copy, and the channel would never quiesce.

## Delivery ordering and dropped messages

Redis pub/sub is fire-and-forget. There is no acknowledgement, no persistence, and no redelivery. The invalidator does not add any: `publish` does not await the client, and the return value of `client.publish` is discarded.

**Ordering.** Redis preserves order per publisher connection, so two events published by the same node arrive at every subscriber in the order they were sent. Across nodes there is no global ordering, and none is needed. Every event is a *clear*, never a write - it removes cache entries and lets the next request repopulate from the adapter. Reordering two clears produces the same end state as either order, and a clear arriving later than expected costs an extra adapter read, never a stale answer. The only cost of redundant or out-of-order delivery is throughput.

**Idempotence.** All four invalidate operations are idempotent, so at-least-once delivery is sufficient. Applying `{ kind: 'all' }` twice clears already-empty caches.

**A dropped message is silent and self-healing.** If the subscriber connection is down, if the message exceeds a guard limit, or if the signature does not verify, the event is simply gone. That node's caches stay stale until the affected entries expire on their own - at most `cacheTTL` seconds, default `60`, and the TTL covers all of it: the subject cache, the role cache, the policy cache and the compiled table. The next request after expiry re-reads from the adapter and is correct again. The failure mode is bounded staleness, not permanent divergence, which is exactly the pre-invalidator behaviour.

Staleness runs in **both** directions, because a grant publishes `{kind:'subject'}` exactly as a revoke does. A deaf replica serves a stale **allow** for a revoked role and a stale **deny** for a freshly granted one, each until its TTL retires the entry. The stale allow is the one to alert on. A time-boxed grant can expire earlier than the TTL, because the cache caps an entry at the grant's own `notAfter` - but nothing shortens the window for an ordinary revoke.

Because a dropped message degrades to TTL expiry, `cacheTTL` is your worst-case staleness budget even with an invalidator wired. Treat the invalidator as the fast path and the TTL as the correctness floor; do not raise `cacheTTL` to hours on the assumption that pub/sub will always land.

## Reconnection behaviour

The invalidator does not implement reconnection, and does not try to detect a broken connection. Reconnection belongs to the Redis client you passed in.

`client.subscribe(channel, handler)` is issued exactly once, on the first `subscribe()` call, guarded by an internal latch. Registering more handlers reuses the same subscription. The teardown function returned by `subscribe()` removes one handler; only when the last handler detaches does the invalidator clear the latch and call `client.unsubscribe?.(channel)`. `engine.dispose()` invokes that teardown, which is why disposing an engine actually releases the Redis subscription instead of leaking it.

What this means operationally:

* **The invalidator never re-issues SUBSCRIBE.** Once `subscribe()` resolves the latch stays set. A `CLIENT KILL`, a failover, or a Redis restart leaves the node permanently deaf unless the client library resubscribes on reconnect.
* **ioredis** re-subscribes automatically after a reconnect, so the handler keeps receiving messages with no involvement from the invalidator.
* **node-redis v4+** likewise restores subscriptions on reconnect. A hand-rolled client may not.
* **A *rejected* first subscribe is different from a killed connection.** It is reported through `onSubscribeError` and retried on the next `subscribe()` call, because the latch is only set after the promise resolves.
* **Messages published during the disconnect window are lost.** Redis buffers nothing for a disconnected subscriber. Those nodes are stale until TTL expiry, per the previous section.

`engine.healthCheck()` probes the adapter and the compiled table. It never
consults the invalidator, so a replica whose subscribe failed - or whose
connection was killed and never restored - reports `ok: true` while serving
pre-revocation decisions for up to one `cacheTTL`. The health endpoint is not
invalidation liveness. Monitor `PUBSUB NUMSUB 

The guards in the diagram carry specific reasoning:

* **16 KB byte cap.** Measured with `Buffer.byteLength(s, 'utf8')`, not `s.length`. A payload of four-byte emoji would sail past a UTF-16 code-unit cap while carrying four times the bytes; a test builds exactly that blob and asserts it is dropped.
* **Depth 8 and 64 keys.** The canonical-JSON serialiser used to compute the HMAC pre-image is recursive, so an adversary who could hand it an arbitrarily deep object could stack-overflow the verifier before authentication. The measuring walker is itself iterative - a 100k-deep payload must not `RangeError`, and a test asserts it does not. `canonicalJSON` additionally carries its own depth-16 cap as defence in depth for the publish path.
* **Refusing a signed envelope in unsigned mode.** Unwrapping it without verifying would let an attacker choose `instanceId`. Set it to a value that collides with the receiver's own UUID and the self-echo filter silences *legitimate* invalidations from every other node - a stale-cache attack that leaves no trace. The envelope is dropped instead.
* **The 30-second replay window.** Checked in both directions (`age > 30_000` or `age < -30_000`), so a message from a node whose clock runs fast is rejected too. Keep the fleet on NTP: this is the failure that looks like a network problem and is not one. A replay *within* the window, onto the channel the envelope was signed for, is accepted - and that is a cache wipe, not a grant.
* **The event vocabulary is drop-only.** `all`, `policies`, `roles`, `subject`; there is no verb that grants anything. The worst a forger with the secret achieves is a cache wipe, never an allow the store does not have.
* **Handler dispatch is per handler, in its own `try/catch`.** Two engines sharing one invalidator is a documented pattern, and an unguarded loop meant engine A's broken handler left engine B on a stale allow.

### Warn coalescing

Drop warns are rate-limited per channel to one every 60 seconds. The first drop on a channel warns immediately and opens the window; further drops inside it are counted silently; the next drop after the window closes warns again and reports how many were suppressed:

```
[@gentleduck/iam:invalidator:redis] dropping unverifiable message on channel "duck-iam:invalidate" (signature mismatch). 412 prior drops coalesced.
```

The window replaced a one-shot latch that an attacker could burn on a benign first drop and then flood behind. The rate-limit state lives at module scope and is keyed by **kind plus channel**, so two invalidators on the same channel in one process share one window - but inbound drops and publish failures do not. Keying on the channel alone meant one junk message a minute claimed the window and coalesced away the publish-failure warning for a broker outage happening at the same time: the report an operator needs most, suppressed by traffic anyone with PUBLISH rights can generate.

## Publish failures

`engine.admin.*` calls `publish()` synchronously and never awaits it. A failing `client.publish` is non-fatal for the local engine, which has already applied the invalidation - but the broadcast is lost, and remote nodes will only converge on TTL expiry. Wire `onPublishError` so a long-lived Redis outage does not silently desync the fleet.

```ts
createIamRedisInvalidator({
  client,
  secret: process.env.IAM_INVALIDATE_SECRET,
  tenantId: tenant.slug,
  onPublishError: (err, channel) => {
    metrics.increment('iam.invalidator.publish_failed', { channel })
    sentry.captureException(err, { extra: { channel } })
  },
  onSubscribeError: (err, channel) => pager.fire('iam-invalidation-deaf', { channel, err }),
})
```

The hook catches a synchronous throw **and a rejected promise**. Only the first used to be caught, and a real client does not fail that way: ioredis publishes asynchronously and rejects against a dead broker, so the one failure the hook exists for was the one it never reported - and the rejection went unhandled, which under Node's default `--unhandled-rejections=throw` takes the process down over a lost cache message.

`onSubscribeError` matters more than `onPublishError`: a failed publish drops one event, a failed subscribe drops every future one. Page on it.

Behaviour pinned by `redis-invalidator-publish-failure.test.ts`:

* The hook receives the **effective** channel, including the tenant suffix - `onPublishError` on a `tenantId: 'acme'` invalidator reports `...:tenant:acme`, so an alert names the tenant that lost its broadcast.
* A non-`Error` throw (a string, an object) is wrapped in a real `Error` before the hook sees it, so `err.message` is always safe to read.
* `publish()` never throws to its caller. A lost broadcast must not fail the local mutation that already succeeded.
* If the hook throws, the throw is swallowed.
* With no hook configured, the failure falls back to the rate-limited `console.warn`, so it is never fully silent. With a hook configured the warn is suppressed - no double reporting.

## API reference

### `createIamRedisInvalidator`

```ts
function createIamRedisInvalidator<TRole extends string = string>(
  config: IamRedisInvalidator.IConfig,
): IamEngineTypes.IInvalidator<TRole>
```

Returns an invalidator bound to the resolved channel. Throws a plain `Error` when `tenantId` is present and fails `/^[A-Za-z0-9_-]{1,64}$/`. Emits one `console.warn` per channel when `secret` is not set.

#### Options

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `client` | `IamRedisInvalidator.IPubSubLike` | required | Pub/sub adapter: `publish`, `subscribe`, optional `unsubscribe` |
| `channel` | `string` | `'duck-iam:invalidate'` | Base channel name; one channel is one broadcast group |
| `tenantId` | `string` | none | Appends `:tenant:<id>` to the channel. Validated against `/^[A-Za-z0-9_-]{1,64}$/`; throws on a bad slug |
| `secret` | `string \| null` | `null` | Shared HMAC-SHA256 secret. When set, publishes `v:2` channel-bound signed envelopes and drops anything that does not verify. Required in production |
| `onPublishError` | `(err: Error, channel: string) => void` | rate-limited `console.warn` | Called when `client.publish` throws **or rejects**. Receives the effective channel |
| `onSubscribeError` | `(err: Error, channel: string) => void` | rate-limited `console.warn` | Called when `client.subscribe` throws or rejects. Page on this |
| `onMessageDropped` | `(reason: string, channel: string, suppressed: number) => void` | rate-limited `console.warn` | An inbound message was refused. Coalesced to one call per 60 s per channel per kind |
| `acceptLegacyUnboundEnvelopes` | `boolean` | `false` | Accept pre-v2, channel-unbound envelopes during a rolling upgrade. Turn it off after |

### `IamRedisInvalidator.IPubSubLike`

```ts
interface IPubSubLike {
  publish(channel: string, message: string): unknown
  subscribe(channel: string, handler: (message: string) => void): void | Promise<void>
  unsubscribe?(channel: string): void | Promise<void>
}
```

Intentionally narrow so neither ioredis nor node-redis becomes a hard dependency. The return value of `publish` is ignored, though a rejection from it still reaches `onPublishError`. `subscribe` may return a promise, and the invalidator awaits it: the `subscribed` latch is only set once it resolves, which is what makes a rejected first subscribe reportable and retryable instead of a node deaf for its whole lifetime. `unsubscribe` is optional: a no-op stub is fine if your client manages connection lifecycle out of band.

### Returned invalidator

```ts
interface IInvalidator<TRole extends string = string> {
  publish(event: IInvalidateEvent<TRole>): void | Promise<void>
  subscribe(handler: (event: IInvalidateEvent<TRole>) => void): () => void
}
```

`subscribe` returns a teardown function. It removes the one handler; when the handler set empties it also clears the subscribe latch and calls `client.unsubscribe?.(channel)`.

### Types

Both live in the type-only `IamRedisInvalidator` namespace, exported from `@gentleduck/iam/invalidators/redis`. Type-only means zero bundle cost.

```ts
import type { IamRedisInvalidator } from '@gentleduck/iam/invalidators/redis'

const config: IamRedisInvalidator.IConfig = {
  client: pubSubClient,
  channel: 'iam:invalidate',
  secret: process.env.IAM_INVALIDATE_SECRET,
}
```

* `IamRedisInvalidator.IPubSubLike` - the minimal pub/sub client surface.
* `IamRedisInvalidator.IConfig` - the config object above.

Two renames to be aware of if you are upgrading. The bare aliases `IRedisPubSubLike` and `IRedisInvalidatorConfig` were deprecated when the namespace landed in 2.0.0 and are gone from 3.0.0 onward. The namespace and the factory both gained the `Iam` prefix in 5.0.0 - `RedisInvalidator` became `IamRedisInvalidator`, and `createRedisInvalidator` became `createIamRedisInvalidator`.

## Custom transports

Nothing in the engine is Redis-specific. `IamEngineTypes.IInvalidator` is the whole contract, and any bus that can carry a JSON string satisfies it:

```ts
import type { IamEngineTypes } from '@gentleduck/iam/core'

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

Works with NATS, Kafka, RabbitMQ, MQTT, or an in-process `EventEmitter`. Two things the Redis implementation does that a hand-rolled one must decide about deliberately:

1. **Self-echo filtering.** If your bus delivers a publisher's own messages back to it, embed a per-process id and filter on it, or every mutation will clear caches twice.
2. **Payload validation.** The snippet above trusts `msg.data` completely. On a bus reachable by anything other than your own fleet, validate the parsed event's `kind` and required fields before handing it to the engine.

## Gotchas

* **A subscribed Redis connection cannot publish.** Passing the same client for both directions works until the first `subscribe`, then every `publish` errors - and with `onPublishError` unwired, that surfaces only as a coalesced warn.
* **`engine.dispose()` is what releases the subscription.** In a serverless or test setup that constructs engines per invocation, skipping `dispose` leaks a handler per engine on a shared client.
* **Do not raise `cacheTTL` because you have an invalidator.** The TTL is the floor that bounds a dropped message; the invalidator is only the fast path.
* **`{ kind: 'roles' }` with no `roleId` is a much bigger hammer than one with a `roleId`.** It clears the whole subject cache on every node. `admin.import()` emits exactly this, so a bulk import is a fleet-wide subject-cache flush - schedule accordingly.
* **The unsigned-mode warn fires once per channel**, latched at module scope on the full channel name. It is a configuration statement, not an event stream: grep for it at startup, do not alert on its rate, and do not read its absence after the first line as evidence that anything was fixed.
* **Publishing is fire-and-forget even in the happy path.** A `publish` that Redis accepts but never delivers - because the subscriber was mid-reconnect - is indistinguishable from success on the publishing node.
* **`healthCheck()` is not invalidation liveness.** It reports `ok: true` on a node that never subscribed. `PUBSUB NUMSUB <channel>` is the check.

## See also

* [Caching](/duck-iam/advanced/engine/caching) - the five caches, their keys, and what each invalidation event clears
* [Admin API](/duck-iam/advanced/engine/admin) - the mutations that trigger a broadcast
* [Redis adapter](/duck-iam/integrations/adapters/redis) - storing policies and roles in Redis, distinct from this invalidator
* [Metrics aggregator](/duck-iam/integrations/observability/metrics) - the other half of a production observability setup
* [Production guide](/duck-iam/guides/production) - the full hardening checklist