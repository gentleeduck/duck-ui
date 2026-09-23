`IamEngineTypes.IHooks` carries seven optional callbacks. One of them can rewrite the request; the other six observe. This page gives each hook its signature and arguments, pins the order they fire in, and states exactly what the engine does when a hook throws.

## The seven hooks

```ts
import type { IamEngineTypes } from '@gentleduck/iam'

interface IHooks<TAction, TResource, TScope, TRole> {
  beforeEvaluate?(request: IamRequest.IAccessRequest<TAction, TResource, TScope>):
    | IamRequest.IAccessRequest<TAction, TResource, TScope>
    | Promise<IamRequest.IAccessRequest<TAction, TResource, TScope>>
  afterEvaluate?(request: IamRequest.IAccessRequest<TAction, TResource, TScope>, decision: AccessControl.IDecision): void | Promise<void>
  onDeny?(request: IamRequest.IAccessRequest<TAction, TResource, TScope>, decision: AccessControl.IDecision): void | Promise<void>
  onError?(error: Error, request: IamRequest.IAccessRequest<TAction, TResource, TScope>): void | Promise<void>
  onPolicyError?(error: Error, policyId: string): void
  onMetrics?(event: IamEngineTypes.IMetricsEvent<TAction, TResource>): void
  onMutation?(event: IamEngineTypes.IMutationEvent<TRole, TScope>): void | Promise<void>
}
```

| Hook | Fires | Awaited | Modes | Can change the verdict |
| --- | --- | --- | --- | --- |
| `beforeEvaluate` | Once per evaluation, before it | yes | both | yes - it returns the request that gets evaluated |
| `afterEvaluate` | Once per evaluation, after it | yes | both | no |
| `onDeny` | After `afterEvaluate`, only on a deny | yes | both | no |
| `onError` | On any caught evaluation or resolution error | yes | both | no |
| `onPolicyError` | Per policy that throws during evaluation, and on a compile failure | no | both | no |
| `onMetrics` | Once per terminal path | no | both | no |
| `onMutation` | After every `engine.admin` write lands and its caches are invalidated | yes | both | no |

`afterEvaluate` and `onDeny` fire in production too. A denial log is a production concern if there is one, so the engine synthesises a verdict-only `IDecision` for them there: verdict, `effect`, `duration` and `timestamp`, but no `policy` / `rule` and a generic `reason`. That is not a shortcut - production evaluates through the compiled table, where a `CONST_ALLOW` cell is one byte and `allow` is a raw bitmask, so policy identity is erased at compile time. Reconstructing it means running the interpreter, which is what development mode is. The decision object is built **only** when one of the two hooks is wired, so leaving them unset still costs no allocation.

## Firing order

Two ordering facts that matter. First, `ensureEnvNow` runs **after** `beforeEvaluate`, so a hook that pins `environment.now` for a test or a replay wins; the engine only injects a clock when nobody set one. Second, `afterEvaluate`, `onDeny` and `onMetrics` all run outside the evaluation `try` block, which is what makes the throw semantics below possible.

On the error path the order collapses to `onError` then `onMetrics`, with the metrics event reporting `allowed: false` and `failOpen: false`.

### In permissions()

Each entry in the batch runs the **full** per-check pipeline: its own `beforeEvaluate`, its own `ensureEnvNow`, its own scope enrichment, its own `afterEvaluate` / `onDeny`, its own `onMetrics`. Scope enrichment is memoised per scope inside the batch, so twenty checks sharing one scope rebuild the merged role list once, not twenty times.

Two batch-specific behaviours:

* If subject resolution or the policy load fails, `onError` fires **once** with a synthetic request (`roles: []`, the first check's action and resource) and the whole map comes back all-`false`. No per-check hooks run.
* `{ telemetry: false }` suppresses the per-check `onMetrics` emission and the `performance.now()` calls behind it. Every other hook still fires.

### In explain()

Only `beforeEvaluate` runs. `afterEvaluate`, `onDeny`, `onError`, `onPolicyError` and `onMetrics` do **not** fire - an explain trace is read-only diagnostics and is deliberately invisible to your telemetry.

## Throw semantics

`beforeEvaluate` is the only hook that can affect the outcome, because it is the only one that runs inside the evaluation `try`. A throw there is indistinguishable from an adapter failure: `onError` fires and the engine returns a fail-closed deny.

Everything else is wrapped. A throwing `afterEvaluate` cannot rewrite an allow into a deny; a throwing `onDeny` cannot turn a deny into a rejected promise; a throwing `onError` cannot escape and defeat the documented fail-closed behaviour. The wrapper catches both synchronous throws and rejected promises, reports them with `console.error`, and even wraps that `console.error` call - a daemon with a closed stdout or a user-replaced `Console` must not be able to crash an authorization decision.

Throwing from `afterEvaluate` or `onDeny` is silently swallowed - the request
proceeds with the verdict the policies produced. Deny a request by writing a
policy, or by enriching the request in `beforeEvaluate` so an existing policy
denies it.

`onPolicyError` and `onMetrics` are not awaited, so returning a promise from them is fire-and-forget: an async body's rejection becomes an unhandled rejection rather than something the engine swallows. Keep both synchronous.

## API reference

### beforeEvaluate

Receives the request after role normalisation and scope enrichment, and returns the request that will actually be evaluated. Use it for context you cannot trust the caller to supply.

```ts
const hooks: IamEngineTypes.IHooks = {
  beforeEvaluate: (request) => ({
    ...request,
    environment: {
      ...request.environment,
      hour: new Date().getHours(),
      country: geoip.lookup(request.environment?.ip)?.country,
    },
  }),
}
```

Common uses: server-side timestamps, derived time fields (`hour`, `dayOfWeek`), geo-IP enrichment, feature flags, subdomain-to-tenant translation. It runs on every check, so anything expensive belongs in subject resolution or a cache instead.

Setting `environment.now` here pins the evaluation clock for temporal operators (`before` / `after`) and for `$environment.now`, which is how you write deterministic tests against time-based policies.

### afterEvaluate

```ts
const hooks: IamEngineTypes.IHooks = {
  afterEvaluate: async (request, decision) => {
    await auditQueue.publish({
      subject: request.subject.id,
      action: request.action,
      resource: request.resource.type,
      resourceId: request.resource.id,
      allowed: decision.allowed,
      reason: decision.reason,
      policy: decision.policy,
      duration: decision.duration,
      timestamp: decision.timestamp,
    })
  },
}
```

Fires for allow and deny alike, in both modes, and it is awaited - a slow audit write adds directly to check latency. Prefer queueing over writing inline. In production `decision.policy` and `decision.rule` are `undefined` and `reason` is generic, so do not build an audit log that depends on them and then flip modes.

### onDeny

Fires after `afterEvaluate`, only when `decision.allowed` is `false`, with the same request and decision objects.

```ts
const hooks: IamEngineTypes.IHooks = {
  onDeny: async (request, decision) => {
    metrics.increment('access.denied', { action: request.action, resource: request.resource.type })
    const denials = await redis.incr(`denials:${request.subject.id}`)
    await redis.expire(`denials:${request.subject.id}`, 60)
    if (denials > 20) await alertSecurityTeam(request.subject.id)
  },
}
```

### onError

```ts
const hooks: IamEngineTypes.IHooks = {
  onError: (error, request) => {
    sentry.captureException(error, {
      user: { id: request.subject.id },
      tags: { action: request.action, resource: request.resource.type },
    })
  },
}
```

Fires when the engine caught something and fell back to a fail-closed verdict:

* The adapter threw, timed out, or returned more rows than `maxPolicies` / `maxRoles`.
* A subject load was shed because `maxConcurrentSubjectLoads` was reached (the message contains `subject load shed`).
* `beforeEvaluate` threw.
* Anything internal threw, which indicates a bug - including a development-mode disagreement between the compiled table and the interpreter.

A role set over 32 is **not** on this list. It is not an error: the engine drops to the interpreter, warns once, and reports the fallback on `healthCheck().compiledTable`. A compile failure that is not the role limit reaches `onPolicyError`, not `onError`.

On the `can` / `check` / `permissions` failure paths the request handed to `onError` is *synthetic*: it carries the subject ID with `roles: []` and `attributes: {}`, because the real subject is exactly what could not be resolved. Do not treat `request.subject.roles` in an `onError` handler as authoritative.

### onPolicyError

```ts
const hooks: IamEngineTypes.IHooks = {
  onPolicyError: (error, policyId) => {
    sentry.captureException(error, { extra: { policyId } })
    log.warn(`duck-iam: policy "${policyId}" skipped during evaluation`)
  },
}
```

Fires when evaluating **one** policy throws - a malformed rule, a condition tree the adapter stored badly, an attribute that makes an operator blow up - and when a policy fails to compile. It is the only signal an operator gets that a stored row is rotten. It receives the primitive `policyId`, a string, not the policy object the evaluator's own handler receives; there are three `onPolicyError` shapes in this package and they are not interchangeable, so write an inline arrow (contextually typed against all three) rather than a named function.

The offending policy stays **applicable** and votes Indeterminate: it denies if the policy carries any deny rule, and otherwise casts the `defaultEffect` vote. It is not treated as NotApplicable, because skipping a policy that could have denied is exactly what turns a throw into an allow under `policyCombine: 'and'`.

RBAC is the one deliberate exception. `rbacVote` catches per grant group rather than around the whole scan, because scoped and conditioned role grants are independent grants from separate roles that only look like one policy because the compiler folds them into a single allow-only `__rbac__`. Abstaining per grant is safe there precisely because role permissions are allow-only - there is no deny to lose - and wrapping the whole loop instead let one unreadable permission delete every unrelated grant in the cell.

A compile failure is reported the same way: `IamPolicyCompileError` is forwarded here with its `policyId` and then rethrown, and every request is denied until the policy is fixed. The forward is wrapped in its own try, so a throwing handler cannot replace the compile error.

With no handler, a policy that throws on every request votes Indeterminate
forever with nobody told. Under `defaultEffect: 'allow'` an allow-only policy
in that state is a silent widening of access. Wire it - the cost is a function
call on a path that should never fire.

### onMetrics

```ts
interface IMetricsEvent<TAction, TResource> {
  readonly subjectId: string
  readonly action: TAction
  readonly resource: TResource
  readonly allowed: boolean
  readonly durationMs: number
  readonly mode: AccessControl.Mode
  readonly failOpen: boolean
}
```

| Field | Meaning |
| --- | --- |
| `subjectId` | `request.subject.id` at the time of the check. |
| `action` | The action checked. |
| `resource` | The resource **type** checked, not its ID. |
| `allowed` | Final verdict. `false` on every error path. |
| `durationMs` | `performance.now()` delta across the whole evaluation, including hooks that ran inside it. |
| `mode` | `'development'` or `'production'`. |
| `failOpen` | `true` only when the verdict was allow **solely** because `defaultEffect: 'allow'` fired with nothing applicable. `false` for an explicit allow, and `false` for every deny. |

```ts
new IamEngine({
  adapter,
  mode: 'production',
  hooks: {
    onMetrics: (event) => {
      otel.recordDuration('iam.authorize', event.durationMs, { action: event.action, mode: event.mode })
      otel.recordCounter('iam.decisions', 1, { outcome: event.allowed ? 'allow' : 'deny' })
      if (event.failOpen) otel.recordCounter('iam.fail_open', 1)
    },
  },
})
```

`failOpen` is the alert to build first. A rising fail-open rate means the policy set stopped covering requests it used to cover - a broken adapter, a mass deletion, rules dropped for throwing - and the boolean verdict alone hides that completely. Available since 2.1.0, alongside the matching counter in [the metrics aggregator](/duck-iam/integrations/observability/metrics).

The hook is genuinely free when unwired: the engine only captures `performance.now()` at the start of an evaluation if `onMetrics` is set, so the cost of leaving it off is one property check.

### onMutation

The audit seam. It fires after every write `engine.admin` performs, with a discriminated union keyed on `type`.

```ts
type IMutationEvent<TRole, TScope> =
  | { type: 'policy.saved';        policyId: string }
  | { type: 'policy.deleted';      policyId: string }
  | { type: 'role.saved';          roleId: TRole }
  | { type: 'role.deleted';        roleId: TRole }
  | { type: 'role.assigned';       subjectId: string; roleId: TRole; scope?: TScope; changed?: boolean }
  | { type: 'role.revoked';        subjectId: string; roleId: TRole; scope?: TScope; changed?: boolean }
  | { type: 'role.scope-changed';  subjectId: string; roleId: TRole; fromScope?: TScope; toScope?: TScope }
  | { type: 'attributes.set';      subjectId: string; keys: readonly string[] }
```

Every variant also carries `at` (`Date.now()` when the write completed) and an optional `actor` when the caller supplied one.

```ts
const hooks: IamEngineTypes.IHooks = {
  onMutation: async (event) => {
    await auditLog.append({ ...event, service: 'api' })
  },
}
```

Four things about it are load-bearing:

* **It is the only evidence a revocation happened.** The assignment row is hard-deleted, so nothing else in the library records it.
* **It fires after the adapter write resolves and after invalidation**, so an event is never emitted for a write that threw, and a consumer reacting to one never reads a cache still holding the old answer.
* **`attributes.set` carries key *names*, never values.** Attribute bags routinely hold personal data, and an event a consumer will likely write to a durable log is the wrong place to copy it to. Read values back with `admin.getAttributes` if the history genuinely needs them.
* **`changed` is absent rather than guessed.** `true`/`false` when the driver could report whether the write actually created or removed the grant; `undefined` when it could not - MySQL's insert-ignore has no `RETURNING`, and the per-row loop path returns void.

Under `withTransaction` events buffer alongside the invalidations and drain on `pending.flush()`; a rollback discards them. Batch writes emit one event per row, so wiring this makes a large `assignRoles` proportionally more expensive - the whole bus is skipped when the hook is unset.

## Gotchas

* **`afterEvaluate` and `onDeny` fire in production, but with a verdict-only decision.** Auditing that reads `decision.policy` or `decision.rule` silently starts logging `undefined` when you flip `mode`.
* **Neither `afterEvaluate` nor `onDeny` fires on the error path**, in either mode. Only `onError` and `onMetrics` do. That is deliberate, not an oversight.
* **`can()` with an invalid `subjectId` fires no hook at all** - not even `onError`.
* **A throwing `afterEvaluate` / `onDeny` / `onError` / `onMetrics` is swallowed, not surfaced.** Watch `console.error` for `hook threw - swallowed to preserve decision`.
* **`beforeEvaluate` is awaited on every single check.** In a batch it is awaited once per check, not once per batch.
* **`explain()` fires no telemetry at all.** Traces do not appear in `onMetrics` counts.
* **`onMetrics` reports the resource *type*.** `resource.id` is not in the event; add it from your own call site if you need per-instance metrics.

## See also

* [Engine methods](/duck-iam/advanced/engine/methods)
* [Development vs production mode](/duck-iam/advanced/engine/modes)
* [Metrics aggregator](/duck-iam/integrations/observability/metrics)
* [Explain and debug](/duck-iam/advanced/explain)